package com.devin.lms.controller;

import com.devin.lms.model.Book;
import com.devin.lms.payload.*;
import com.devin.lms.repository.BookRepository;
import com.devin.lms.repository.BorrowRepository;
import com.devin.lms.repository.UserRepository;
import com.devin.lms.security.CurrentUser;
import com.devin.lms.security.UserPrincipal;
import com.devin.lms.service.BookService;
import com.devin.lms.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.validation.Valid;
import java.net.URI;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookService bookService;

    private static final Logger logger = LoggerFactory.getLogger(BookController.class);

    @GetMapping
    public PagedResponse<BookResponse> getBooks(@CurrentUser UserPrincipal currentUser,
                                                @RequestParam(value = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
                                                @RequestParam(value = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return bookService.getAllBooks(currentUser, page, size);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createBook(@Valid @RequestBody BookRequest bookRequest) {
        Book book = bookService.createBook(bookRequest);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{bookId}")
                .buildAndExpand(book.getId()).toUri();

        return ResponseEntity.created(location)
                .body(new ApiResponse(true, "Book Created Successfully"));
    }

    @GetMapping("/{bookId}")
    public BookResponse getBookById(@CurrentUser UserPrincipal currentUser,
                                    @PathVariable Long bookId) {
        return bookService.getBookById(bookId, currentUser);
    }

    @PostMapping("/{bookId}/borrows")
    @PreAuthorize("hasRole('USER')")
    public BookResponse castBorrow(@CurrentUser UserPrincipal currentUser,
                                 @PathVariable Long bookId,
                                 @Valid @RequestBody BorrowRequest borrowRequest) {
        return bookService.castBorrowAndGetUpdatedBook(bookId, borrowRequest, currentUser);
    }
}
