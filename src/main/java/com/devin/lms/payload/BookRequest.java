package com.devin.lms.payload;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

public class BookRequest {
    @NotBlank
    @Size(max = 70)
    private String title;

    @NotBlank
    @Size(max = 20)
    private String isbn;

    @NotBlank
    @Size(max = 50)
    private String genre;

    @NotBlank
    @Size(max = 140)
    private String content;

    @NotBlank
    @Size(max = 70)
    private String author;

    @NotBlank
    @Size(max = 140)
    private String imageUrl;

    @NotNull
    @Size(min = 2, max = 6)
    @Valid
    private List<CopyRequest> copies;

    @NotNull
    @Valid
    private BookLength bookLength;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<CopyRequest> getCopies() {
        return copies;
    }

    public void setCopies(List<CopyRequest> copies) {
        this.copies = copies;
    }

    public BookLength getBookLength() {
        return bookLength;
    }

    public void setBookLength(BookLength bookLength) {
        this.bookLength = bookLength;
    }
}
