package com.devin.lms.util;

import com.devin.lms.model.Book;
import com.devin.lms.model.User;
import com.devin.lms.payload.BookResponse;
import com.devin.lms.payload.CopyResponse;
import com.devin.lms.payload.UserSummary;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ModelMapper {

    public static BookResponse mapBookToBookResponse(Book book, Map<Long, Long> copyBorrowsMap, User creator, Long userBorrow) {
        BookResponse bookResponse = new BookResponse();
        bookResponse.setId(book.getId());
        bookResponse.setTitle(book.getTitle());
        bookResponse.setIsbn(book.getIsbn());
        bookResponse.setGenre(book.getGenre());
        bookResponse.setContent(book.getContent());
        bookResponse.setAuthor(book.getAuthor());
        bookResponse.setImageUrl(book.getImageUrl());
        bookResponse.setCreationDateTime(book.getCreatedAt());
        bookResponse.setExpirationDateTime(book.getExpirationDateTime());
        Instant now = Instant.now();
        bookResponse.setExpired(book.getExpirationDateTime().isBefore(now));

        List<CopyResponse> copyResponses = book.getCopies().stream().map(copy -> {
            CopyResponse copyResponse = new CopyResponse();
            copyResponse.setId(copy.getId());
            copyResponse.setStatus(copy.getStatus());

            if(copyBorrowsMap.containsKey(copy.getId())) {
                copyResponse.setBorrowCount(copyBorrowsMap.get(copy.getId()));
            } else {
                copyResponse.setBorrowCount(0);
            }
            return copyResponse;
        }).collect(Collectors.toList());

        bookResponse.setCopies(copyResponses);
        UserSummary creatorSummary = new UserSummary(creator.getId(), creator.getUsername(), creator.getName());
        bookResponse.setCreatedBy(creatorSummary);

        if(userBorrow != null) {
            bookResponse.setSelectedCopy(userBorrow);
        }

        long totalBorrows = bookResponse.getCopies().stream().mapToLong(CopyResponse::getBorrowCount).sum();
        bookResponse.setTotalBorrows(totalBorrows);

        return bookResponse;
    }

}
