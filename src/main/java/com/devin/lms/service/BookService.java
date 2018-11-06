package com.devin.lms.service;

import com.devin.lms.exception.BadRequestException;
import com.devin.lms.exception.ResourceNotFoundException;
import com.devin.lms.model.*;
import com.devin.lms.payload.BookRequest;
import com.devin.lms.payload.BookResponse;
import com.devin.lms.payload.BorrowRequest;
import com.devin.lms.payload.PagedResponse;
import com.devin.lms.repository.BookRepository;
import com.devin.lms.repository.BorrowRepository;
import com.devin.lms.repository.UserRepository;
import com.devin.lms.security.UserPrincipal;
import com.devin.lms.util.AppConstants;
import com.devin.lms.util.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(BookService.class);

    public PagedResponse<BookResponse> getAllBooks(UserPrincipal currentUser, int page, int size) {
        validatePageNumberAndSize(page, size);

        // Retrieve Books
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        Page<Book> books = bookRepository.findAll(pageable);

        if(books.getNumberOfElements() == 0) {
            return new PagedResponse<>(Collections.emptyList(), books.getNumber(),
                    books.getSize(), books.getTotalElements(), books.getTotalPages(), books.isLast());
        }

        // Map Books to BooksResponses containing borrow counts and book creator details
        List<Long> bookIds = books.map(Book::getId).getContent();
        Map<Long, Long> copyBorrowCountMap = getCopyBorrowCountMap(bookIds);
        Map<Long, Long> bookUserBorrowMap = getBookUserBorrowMap(currentUser, bookIds);
        Map<Long, User> creatorMap = getBookCreatorMap(books.getContent());

        List<BookResponse> bookResponses = books.map(book -> {
            return ModelMapper.mapBookToBookResponse(book,
                    copyBorrowCountMap,
                    creatorMap.get(book.getCreatedBy()),
                    bookUserBorrowMap == null ? null : bookUserBorrowMap.getOrDefault(book.getId(), null));
        }).getContent();

        return new PagedResponse<>(bookResponses, books.getNumber(),
                books.getSize(), books.getTotalElements(), books.getTotalPages(), books.isLast());
    }

    public PagedResponse<BookResponse> getBooksCreatedBy(String username, UserPrincipal currentUser, int page, int size) {
        validatePageNumberAndSize(page, size);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Retrieve all books created by the given username
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        Page<Book> books = bookRepository.findByCreatedBy(user.getId(), pageable);

        if (books.getNumberOfElements() == 0) {
            return new PagedResponse<>(Collections.emptyList(), books.getNumber(),
                    books.getSize(), books.getTotalElements(), books.getTotalPages(), books.isLast());
        }

        // Map Books to BookResponses containing borrow counts and book creator details
        List<Long> bookIds = books.map(Book::getId).getContent();
        Map<Long, Long> copyBorrowCountMap = getCopyBorrowCountMap(bookIds);
        Map<Long, Long> bookUserBorrowMap = getBookUserBorrowMap(currentUser, bookIds);

        List<BookResponse> bookResponses = books.map(book -> {
            return ModelMapper.mapBookToBookResponse(book,
                    copyBorrowCountMap,
                    user,
                    bookUserBorrowMap == null ? null : bookUserBorrowMap.getOrDefault(book.getId(), null));
        }).getContent();

        return new PagedResponse<>(bookResponses, books.getNumber(),
                books.getSize(), books.getTotalElements(), books.getTotalPages(), books.isLast());
    }

    public PagedResponse<BookResponse> getBooksBorrowedBy(String username, UserPrincipal currentUser, int page, int size) {
        validatePageNumberAndSize(page, size);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Retrieve all bookIds in which the given username has borrowed
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        Page<Long> userBorrowedBookIds = borrowRepository.findBorrowedBookIdsByUserId(user.getId(), pageable);

        if (userBorrowedBookIds.getNumberOfElements() == 0) {
            return new PagedResponse<>(Collections.emptyList(), userBorrowedBookIds.getNumber(),
                    userBorrowedBookIds.getSize(), userBorrowedBookIds.getTotalElements(),
                    userBorrowedBookIds.getTotalPages(), userBorrowedBookIds.isLast());
        }

        // Retrieve all book details from the borrowed bookIds.
        List<Long> bookIds = userBorrowedBookIds.getContent();

        Sort sort = new Sort(Sort.Direction.DESC, "createdAt");
        List<Book> books = bookRepository.findByIdIn(bookIds, sort);

        // Map Books to BookResponses containing borrow counts and book creator details
        Map<Long, Long> copyBorrowCountMap = getCopyBorrowCountMap(bookIds);
        Map<Long, Long> bookUserBorrowMap = getBookUserBorrowMap(currentUser, bookIds);
        Map<Long, User> creatorMap = getBookCreatorMap(books);

        List<BookResponse> bookResponses = books.stream().map(book -> {
            return ModelMapper.mapBookToBookResponse(book,
                    copyBorrowCountMap,
                    creatorMap.get(book.getCreatedBy()),
                    bookUserBorrowMap == null ? null : bookUserBorrowMap.getOrDefault(book.getId(), null));
        }).collect(Collectors.toList());

        return new PagedResponse<>(bookResponses, userBorrowedBookIds.getNumber(), userBorrowedBookIds.getSize(), userBorrowedBookIds.getTotalElements(), userBorrowedBookIds.getTotalPages(), userBorrowedBookIds.isLast());
    }

    public Book createBook(BookRequest bookRequest) {
        Book book = new Book();
        book.setTitle(bookRequest.getTitle());
        book.setIsbn(bookRequest.getIsbn());
        book.setGenre(bookRequest.getGenre());
        book.setContent(bookRequest.getContent());
        book.setAuthor(bookRequest.getAuthor());
        book.setImageUrl(bookRequest.getImageUrl());

        bookRequest.getCopies().forEach(copyRequest -> {
            book.addCopy(new Copy(copyRequest.getStatus()));
        });

        Instant now = Instant.now();
        Instant expirationDateTime = now.plus(Duration.ofDays(bookRequest.getBookLength().getDays()))
                .plus(Duration.ofHours(bookRequest.getBookLength().getHours()));

        book.setExpirationDateTime(expirationDateTime);

        return bookRepository.save(book);
    }

    public BookResponse getBookById(Long bookId, UserPrincipal currentUser) {
        Book book = bookRepository.findById(bookId).orElseThrow(
                () -> new ResourceNotFoundException("Book", "id", bookId));

        // Retrieve Borrow Counts of every copy belonging to the current book
        List<CopyBorrowCount> borrows = borrowRepository.countByBookIdGroupByCopyId(bookId);

        Map<Long, Long> copyBorrowsMap = borrows.stream()
                .collect(Collectors.toMap(CopyBorrowCount::getCopyId, CopyBorrowCount::getBorrowCount));

        // Retrieve book creator details
        User creator = userRepository.findById(book.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", book.getCreatedBy()));

        // Retrieve borrow done by logged in user
        Borrow userBorrow = null;
        if(currentUser != null) {
            userBorrow = borrowRepository.findByUserIdAndBookId(currentUser.getId(), bookId);
        }

        return ModelMapper.mapBookToBookResponse(book, copyBorrowsMap,
                creator, userBorrow != null ? userBorrow.getCopy().getId(): null);
    }

    public BookResponse castBorrowAndGetUpdatedBook(Long bookId, BorrowRequest borrowRequest, UserPrincipal currentUser) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        if(book.getExpirationDateTime().isBefore(Instant.now())) {
            throw new BadRequestException("Sorry! This Book has already removed");
        }

        User user = userRepository.getOne(currentUser.getId());

        Copy selectedCopy = book.getCopies().stream()
                .filter(copy -> copy.getId().equals(borrowRequest.getCopyId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Copy", "id", borrowRequest.getCopyId()));

        Borrow borrow = new Borrow();
        borrow.setBook(book);
        borrow.setUser(user);
        borrow.setCopy(selectedCopy);

        try {
            borrow = borrowRepository.save(borrow);
        } catch (DataIntegrityViolationException ex) {
            logger.info("User {} has already borrowed this Book {}", currentUser.getId(), bookId);
            throw new BadRequestException("Sorry! You have already borrowed this Book");
        }

        //-- Borrow Saved, Return the updated Book Response now --

        // Retrieve Borrow Counts of every copy belonging to the current book
        List<CopyBorrowCount> borrows = borrowRepository.countByBookIdGroupByCopyId(bookId);

        Map<Long, Long> copyBorrowsMap = borrows.stream()
                .collect(Collectors.toMap(CopyBorrowCount::getCopyId, CopyBorrowCount::getBorrowCount));

        // Retrieve book creator details
        User creator = userRepository.findById(book.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", book.getCreatedBy()));

        return ModelMapper.mapBookToBookResponse(book, copyBorrowsMap, creator, borrow.getCopy().getId());
    }

    private void validatePageNumberAndSize(int page, int size) {
        if(page < 0) {
            throw new BadRequestException("Page number cannot be less than zero.");
        }

        if(size > AppConstants.MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must not be greater than " + AppConstants.MAX_PAGE_SIZE);
        }
    }

    private Map<Long, Long> getCopyBorrowCountMap(List<Long> bookIds) {
        // Retrieve Borrow Counts of every Copy belonging to the given bookIds
        List<CopyBorrowCount> borrows = borrowRepository.countByBookIdInGroupByCopyId(bookIds);

        Map<Long, Long> copyBorrowsMap = borrows.stream()
                .collect(Collectors.toMap(CopyBorrowCount::getCopyId, CopyBorrowCount::getBorrowCount));

        return copyBorrowsMap;
    }

    private Map<Long, Long> getBookUserBorrowMap(UserPrincipal currentUser, List<Long> bookIds) {
        // Retrieve Borrows done by the logged in user to the given bookIds
        Map<Long, Long> bookUserBorrowMap = null;
        if(currentUser != null) {
            List<Borrow> userBorrows = borrowRepository.findByUserIdAndBookIdIn(currentUser.getId(), bookIds);

            bookUserBorrowMap = userBorrows.stream()
                    .collect(Collectors.toMap(borrow -> borrow.getBook().getId(), borrow -> borrow.getCopy().getId()));
        }
        return bookUserBorrowMap;
    }

    Map<Long, User> getBookCreatorMap(List<Book> books) {
        // Get Book Creator details of the given list of books
        List<Long> creatorIds = books.stream()
                .map(Book::getCreatedBy)
                .distinct()
                .collect(Collectors.toList());

        List<User> creators = userRepository.findByIdIn(creatorIds);
        Map<Long, User> creatorMap = creators.stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return creatorMap;
    }
}
