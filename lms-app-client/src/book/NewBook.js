import React, { Component } from 'react';
import { createBook } from '../util/APIUtils';
import { MAX_COPIES, BOOK_TITLE_MAX_LENGTH, BOOK_ISBN_MAX_LENGTH, BOOK_GENRE_MAX_LENGTH, BOOK_CONTENT_MAX_LENGTH, BOOK_AUTHOR_MAX_LENGTH, BOOK_IMAGEURL_MAX_LENGTH, BOOK_COPY_MAX_LENGTH } from '../constants';
import './NewBook.css';
import { Form, Input, Button, Icon, Select, Col, notification } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input

class NewBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: {
                text: ''
            },
            isbn: {
                text: ''
            },
            genre: {
                text: ''
            },
            content: {
                text: ''
            },
            author: {
                text: ''
            },
            imageUrl: {
                text: ''
            },
            copies: [{
                text: ''
            }, {
                text: ''
            }],
            bookLength: {
                days: 1,
                hours: 0
            }
        };
        this.addCopy = this.addCopy.bind(this);
        this.removeCopy = this.removeCopy.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleIsbnChange = this.handleIsbnChange.bind(this);
        this.handleGenreChange = this.handleGenreChange.bind(this);
        this.handleContentChange = this.handleContentChange.bind(this);
        this.handleAuthorChange = this.handleAuthorChange.bind(this);
        this.handleImageUrlChange = this.handleImageUrlChange.bind(this);
        this.handleCopyChange = this.handleCopyChange.bind(this);
        this.handleBookDaysChange = this.handleBookDaysChange.bind(this);
        this.handleBookHoursChange = this.handleBookHoursChange.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }

    addCopy(event) {
        const copies = this.state.copies.slice();
        this.setState({
            copies: copies.concat([{
                text: ''
            }])
        });
    }

    removeCopy(copyNumber) {
        const copies = this.state.copies.slice();
        this.setState({
            copies: [...copies.slice(0, copyNumber), ...copies.slice(copyNumber + 1)]
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const bookData = {
            title: this.state.title.text,
            isbn: this.state.isbn.text,
            genre: this.state.genre.text,
            content: this.state.content.text,
            author: this.state.author.text,
            imageUrl: this.state.imageUrl.text,
            copies: this.state.copies.map(copy => {
                return { status: copy.text }
            }),
            bookLength: this.state.bookLength
        };

        createBook(bookData)
            .then(response => {
                this.props.history.push("/");
            }).catch(error => {
                if (error.status === 401) {
                    this.props.handleLogout('/login', 'error', 'You have been logged out. Please login create book.');
                } else {
                    notification.error({
                        message: 'LMS App',
                        description: error.message || 'Sorry! Something went wrong. Please try again!'
                    });
                }
            });
    }

    validateTitle = (titleText) => {
        if (titleText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your title!'
            }
        } else if (titleText.length > BOOK_TITLE_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Title is too long (Maximum ${BOOK_TITLE_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    validateIsbn = (isbnText) => {
        if (isbnText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your ISBN!'
            }
        } else if (isbnText.length > BOOK_ISBN_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `ISBN is too long (Maximum ${BOOK_ISBN_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    validateGenre = (genreText) => {
        if (genreText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your Genre!'
            }
        } else if (genreText.length > BOOK_GENRE_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Genre is too long (Maximum ${BOOK_GENRE_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    validateContent = (contentText) => {
        if (contentText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your Content!'
            }
        } else if (contentText.length > BOOK_CONTENT_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Content is too long (Maximum ${BOOK_CONTENT_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    validateAuthor = (authorText) => {
        if (authorText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your Author!'
            }
        } else if (authorText.length > BOOK_AUTHOR_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Author is too long (Maximum ${BOOK_AUTHOR_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    validateImageUrl = (imageUrlText) => {
        if (imageUrlText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your Image URL!'
            }
        } else if (imageUrlText.length > BOOK_IMAGEURL_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Image URL is too long (Maximum ${BOOK_IMAGEURL_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleTitleChange(event) {
        const value = event.target.value;
        this.setState({
            title: {
                text: value,
                ...this.validateTitle(value)
            }
        });
    }

    handleIsbnChange(event) {
        const value = event.target.value;
        this.setState({
            isbn: {
                text: value,
                ...this.validateIsbn(value)
            }
        });
    }

    handleGenreChange(event) {
        const value = event.target.value;
        this.setState({
            genre: {
                text: value,
                ...this.validateGenre(value)
            }
        });
    }

    handleContentChange(event) {
        const value = event.target.value;
        this.setState({
            content: {
                text: value,
                ...this.validateContent(value)
            }
        });
    }

    handleAuthorChange(event) {
        const value = event.target.value;
        this.setState({
            author: {
                text: value,
                ...this.validateAuthor(value)
            }
        });
    }

    handleImageUrlChange(event) {
        const value = event.target.value;
        this.setState({
            imageUrl: {
                text: value,
                ...this.validateImageUrl(value)
            }
        });
    }

    validateCopy = (copyText) => {
        if (copyText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter a copy!'
            }
        } else if (copyText.length > BOOK_COPY_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Copy is too long (Maximum ${BOOK_COPY_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleCopyChange(event, index) {
        const copies = this.state.copies.slice();
        const value = event.target.value;

        copies[index] = {
            text: value,
            ...this.validateCopy(value)
        }

        this.setState({
            copies: copies
        });
    }


    handleBookDaysChange(value) {
        const bookLength = Object.assign(this.state.bookLength, { days: value });
        this.setState({
            bookLength: bookLength
        });
    }

    handleBookHoursChange(value) {
        const bookLength = Object.assign(this.state.bookLength, { hours: value });
        this.setState({
            bookLength: bookLength
        });
    }

    isFormInvalid() {
        if (this.state.title.validateStatus !== 'success' || this.state.isbn.validateStatus !== 'success' || this.state.genre.validateStatus !== 'success' || this.state.content.validateStatus !== 'success' || this.state.author.validateStatus !== 'success' || this.state.imageUrl.validateStatus !== 'success') {
            return true;
        }

        for (let i = 0; i < this.state.copies.length; i++) {
            const copy = this.state.copies[i];
            if (copy.validateStatus !== 'success') {
                return true;
            }
        }
    }

    render() {
        const copyViews = [];
        this.state.copies.forEach((copy, index) => {
            copyViews.push(<BookCopy key={index} copy={copy} copyNumber={index} removeCopy={this.removeCopy} handleCopyChange={this.handleCopyChange} />);
        });

        return (
            <div className="new-book-container">
                <h1 className="page-title">Create Book for BID :)</h1>
                <div className="new-book-content">
                    <Form onSubmit={this.handleSubmit} className="create-book-form">
                        <FormItem validateStatus={this.state.title.validateStatus}
                            help={this.state.title.errorMsg} className="book-form-row">
                            <Input
                                placeholder="Enter book title"
                                style={{ fontSize: '16px' }}
                                size="large"
                                // autosize={{ minRows: 1, maxRows: 1 }}
                                name="title"
                                value={this.state.title.text}
                                onChange={this.handleTitleChange} />
                        </FormItem>
                        <FormItem validateStatus={this.state.isbn.validateStatus}
                            help={this.state.isbn.errorMsg} className="book-form-row">
                            <Input
                                placeholder="Enter book ISBN"
                                style={{ fontSize: '16px' }}
                                size="large"
                                // autosize={{ minRows: 1, maxRows: 1 }}
                                name="isbn"
                                value={this.state.isbn.text}
                                onChange={this.handleIsbnChange} />
                            <a href={`https://isbnsearch.org/search?s=${this.state.title.text}`} target="_blank"> Find ISBN</a>
                        </FormItem>
                        <FormItem validateStatus={this.state.genre.validateStatus}
                            help={this.state.genre.errorMsg} className="book-form-row">
                            <Input
                                placeholder="Enter book genre"
                                style={{ fontSize: '16px' }}
                                size="large"
                                // autosize={{ minRows: 1, maxRows: 1 }}
                                name="genre"
                                value={this.state.genre.text}
                                onChange={this.handleGenreChange} />
                        </FormItem>
                        <FormItem validateStatus={this.state.content.validateStatus}
                            help={this.state.content.errorMsg} className="book-form-row">
                            <TextArea
                                placeholder="Enter book content"
                                style={{ fontSize: '16px' }}
                                autosize={{ minRows: 3, maxRows: 6 }}
                                name="content"
                                value={this.state.content.text}
                                onChange={this.handleContentChange} />
                        </FormItem>
                        <FormItem validateStatus={this.state.author.validateStatus}
                            help={this.state.author.errorMsg} className="book-form-row">
                            <Input
                                placeholder="Enter book author"
                                style={{ fontSize: '16px' }}
                                size="large"
                                // autosize={{ minRows: 1, maxRows: 1 }}
                                name="author"
                                value={this.state.author.text}
                                onChange={this.handleAuthorChange} />
                        </FormItem>
                        <FormItem validateStatus={this.state.imageUrl.validateStatus}
                            help={this.state.imageUrl.errorMsg} className="book-form-row">
                            <Input
                                placeholder="Enter book Image URL"
                                style={{ fontSize: '16px' }}
                                size="large"
                                // autosize={{ minRows: 1, maxRows: 1 }}
                                name="imageUrl"
                                value={this.state.imageUrl.text}
                                onChange={this.handleImageUrlChange} />
                            <a href={`https://www.barnesandnoble.com/s/${this.state.title.text}`} target="_blank"> Find IMG</a>
                        </FormItem>
                        {copyViews}
                        <FormItem className="book-form-row">
                            <Button type="dashed" onClick={this.addCopy} disabled={this.state.copies.length === MAX_COPIES}>
                                <Icon type="plus" /> Add a copy
                            </Button>
                        </FormItem>
                        <FormItem className="book-form-row">
                            <Col xs={24} sm={4}>
                                Book length:
                            </Col>
                            <Col xs={24} sm={20}>
                                <span style={{ marginRight: '18px' }}>
                                    <Select
                                        name="days"
                                        defaultValue="1"
                                        onChange={this.handleBookDaysChange}
                                        value={this.state.bookLength.days}
                                        style={{ width: 60 }} >
                                        {
                                            Array.from(Array(8).keys()).map(i =>
                                                <Option key={i}>{i}</Option>
                                            )
                                        }
                                    </Select> &nbsp;Days
                                </span>
                                <span>
                                    <Select
                                        name="hours"
                                        defaultValue="0"
                                        onChange={this.handleBookHoursChange}
                                        value={this.state.bookLength.hours}
                                        style={{ width: 60 }} >
                                        {
                                            Array.from(Array(24).keys()).map(i =>
                                                <Option key={i}>{i}</Option>
                                            )
                                        }
                                    </Select> &nbsp;Hours
                                </span>
                            </Col>
                        </FormItem>
                        <FormItem className="book-form-row">
                            <Button type="primary"
                                htmlType="submit"
                                size="large"
                                disabled={this.isFormInvalid()}
                                className="create-book-form-button">Create Book</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }
}

function BookCopy(props) {
    return (
        <FormItem validateStatus={props.copy.validateStatus}
            help={props.copy.errorMsg} className="book-form-row">

            <Input
                placeholder={'Copy ' + (props.copyNumber + 1)}
                size="large"
                value={props.copy.text}
                className={props.copyNumber > 1 ? "optional-copy" : null}
                onChange={(event) => props.handleCopyChange(event, props.copyNumber)} />

            {
                props.copyNumber > 1 ? (
                    <Icon
                        className="dynamic-delete-button"
                        type="close"
                        disabled={props.copyNumber <= 1}
                        onClick={() => props.removeCopy(props.copyNumber)}
                    />) : null
            }
        </FormItem>
    );
}


export default NewBook;