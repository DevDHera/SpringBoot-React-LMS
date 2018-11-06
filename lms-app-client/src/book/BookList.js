import React, { Component } from 'react';
import { getAllBooks, getUserCreatedBooks, getUserBorrowedBooks } from '../util/APIUtils';
import Book from './Book';
import { castBorrow } from '../util/APIUtils';
import LoadingIndicator from '../common/LoadingIndicator';
import { Button, Icon, notification } from 'antd';
import { BOOK_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './BookList.css';

class BookList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            books: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            currentBorrows: [],
            isLoading: false
        };
        this.loadBookList = this.loadBookList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    loadBookList(page = 0, size = BOOK_LIST_SIZE) {
        let promise;
        if (this.props.username) {
            if (this.props.type === 'USER_CREATED_BOOKS') {
                promise = getUserCreatedBooks(this.props.username, page, size);
            } else if (this.props.type === 'USER_BORROWED_BOOKS') {
                promise = getUserBorrowedBooks(this.props.username, page, size);
            }
        } else {
            promise = getAllBooks(page, size);
        }

        if (!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });

        promise
            .then(response => {
                const books = this.state.books.slice();
                const currentBorrows = this.state.currentBorrows.slice();

                this.setState({
                    books: books.concat(response.content),
                    page: response.page,
                    size: response.size,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages,
                    last: response.last,
                    currentBorrows: currentBorrows.concat(Array(response.content.length).fill(null)),
                    isLoading: false
                })
            }).catch(error => {
                this.setState({
                    isLoading: false
                })
            });

    }

    componentDidMount() {
        this.loadBookList();
    }

    componentDidUpdate(nextProps) {
        if (this.props.isAuthenticated !== nextProps.isAuthenticated) {
            // Reset State
            this.setState({
                books: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
                currentBorrows: [],
                isLoading: false
            });
            this.loadBookList();
        }
    }

    handleLoadMore() {
        this.loadBookList(this.state.page + 1);
    }

    handleBorrowChange(event, bookIndex) {
        const currentBorrows = this.state.currentBorrows.slice();
        currentBorrows[bookIndex] = event.target.value;

        this.setState({
            currentBorrows: currentBorrows
        });
    }


    handleBorrowSubmit(event, bookIndex) {
        event.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'LMS App',
                description: "Please login to borrow.",
            });
            return;
        }

        const book = this.state.books[bookIndex];
        const selectedCopy = this.state.currentBorrows[bookIndex];

        const borrowData = {
            bookId: book.id,
            copyId: selectedCopy
        };

        castBorrow(borrowData)
            .then(response => {
                const books = this.state.books.slice();
                books[bookIndex] = response;
                this.setState({
                    books: books
                });
            }).catch(error => {
                if (error.status === 401) {
                    this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to borrow');
                } else {
                    notification.error({
                        message: 'LMS App',
                        description: error.message || 'Sorry! Something went wrong. Please try again!'
                    });
                }
            });
    }

    render() {
        const bookViews = [];
        this.state.books.forEach((book, bookIndex) => {
            bookViews.push(<Book
                key={book.id}
                book={book}
                currentBorrow={this.state.currentBorrows[bookIndex]}
                handleBorrowChange={(event) => this.handleBorrowChange(event, bookIndex)}
                handleBorrowSubmit={(event) => this.handleBorrowSubmit(event, bookIndex)} />)
        });

        return (
            <div className="books-container">
                {bookViews}
                {
                    !this.state.isLoading && this.state.books.length === 0 ? (
                        <div className="no-books-found">
                            <span>No Books Found.</span>
                        </div>
                    ) : null
                }
                {
                    !this.state.isLoading && !this.state.last ? (
                        <div className="load-more-books">
                            <Button type="dashed" onClick={this.handleLoadMore} disabled={this.state.isLoading}>
                                <Icon type="plus" /> Load more
                            </Button>
                        </div>) : null
                }
                {
                    this.state.isLoading ?
                        <LoadingIndicator /> : null
                }
            </div>
        );
    }
}

export default withRouter(BookList);