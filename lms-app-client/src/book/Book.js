import React, { Component } from 'react';
import './Book.css';
import { Avatar, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { getAvatarColor } from '../util/Colors';
import { formatDateTime } from '../util/Helpers';

import { Radio, Button } from 'antd';
const RadioGroup = Radio.Group;

class Book extends Component {
    calculatePercentage = (copy) => {
        if (this.props.book.totalBorrows === 0) {
            return 0;
        }
        return (copy.borrowCount * 100) / (this.props.book.totalBorrows);
    };

    isSelected = (copy) => {
        return this.props.book.selectedCopy === copy.id;
    }

    getWinningCopy = () => {
        return this.props.book.copies.reduce((prevCopy, currentCopy) =>
            currentCopy.borrowCount > prevCopy.borrowCount ? currentCopy : prevCopy,
            { borrowCount: -Infinity }
        );
    }

    getTimeRemaining = (book) => {
        const expirationTime = new Date(book.expirationDateTime).getTime();
        const currentTime = new Date().getTime();

        var difference_ms = expirationTime - currentTime;
        var seconds = Math.floor((difference_ms / 1000) % 60);
        var minutes = Math.floor((difference_ms / 1000 / 60) % 60);
        var hours = Math.floor((difference_ms / (1000 * 60 * 60)) % 24);
        var days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

        let timeRemaining;

        if (days > 0) {
            timeRemaining = days + " days left";
        } else if (hours > 0) {
            timeRemaining = hours + " hours left";
        } else if (minutes > 0) {
            timeRemaining = minutes + " minutes left";
        } else if (seconds > 0) {
            timeRemaining = seconds + " seconds left";
        } else {
            timeRemaining = "less than a second left";
        }

        return timeRemaining;
    }

    render() {
        const bookCopies = [];
        if (this.props.book.selectedCopy || this.props.book.expired) {
            const winningCopy = this.props.book.expired ? this.getWinningCopy() : null;

            this.props.book.copies.forEach(copy => {
                bookCopies.push(<CompletedOrBorrowedBookCopy
                    key={copy.id}
                    copy={copy}
                    isWinner={winningCopy && copy.id === winningCopy.id}
                    isSelected={this.isSelected(copy)}
                    percentBorrow={this.calculatePercentage(copy)}
                />);
            });
        } else {
            this.props.book.copies.forEach(copy => {
                bookCopies.push(<Radio className="book-copy-radio" key={copy.id} value={copy.id}>{copy.status}</Radio>)
            })
        }
        return (
            <div className="book-content">
                <div className="book-header">
                    <div className="book-creator-info">
                        <Link className="creator-link" to={`/users/${this.props.book.createdBy.username}`}>
                            <Avatar className="book-creator-avatar"
                                style={{ backgroundColor: getAvatarColor(this.props.book.createdBy.name) }} >
                                {this.props.book.createdBy.name[0].toUpperCase()}
                            </Avatar>
                            <span className="book-creator-name">
                                {this.props.book.createdBy.name}
                            </span>
                            <span className="book-creator-username">
                                @{this.props.book.createdBy.username}
                            </span>
                            <span className="book-creation-date">
                                {formatDateTime(this.props.book.creationDateTime)}
                            </span>
                        </Link>
                    </div>
                    <div className="book-title">
                        {this.props.book.title}
                    </div>
                    <div className="book-author">
                        {this.props.book.author}
                    </div>
                    <div className="book-genre">
                        {this.props.book.genre}
                    </div>
                    <div className="book-content">
                        {this.props.book.content}
                    </div>
                </div>
                <div className="book-copies">
                    <RadioGroup
                        className="book-copy-radio-group"
                        onChange={this.props.handleBorrowChange}
                        value={this.props.currentBorrow}>
                        {bookCopies}
                    </RadioGroup>
                </div>
                <div className="book-footer">
                    {
                        !(this.props.book.selectedCopy || this.props.book.expired) ?
                            (<Button className="borrow-button" disabled={!this.props.currentBorrow} onClick={this.props.handleBorrowSubmit}>Borrow</Button>) : null
                    }
                    <span className="total-borrows">{this.props.book.totalBorrows} borrows</span>
                    <span className="separator">•</span>
                    <span className="time-left">
                        {
                            this.props.book.expired ? "Final Remainder" :
                                this.getTimeRemaining(this.props.book)
                        }
                    </span>
                </div>
            </div>
        );
    }
}

function CompletedOrBorrowedBookCopy(props) {
    return (
        <div className="cv-book-copy">
            <span className="cv-book-copy-details">
                <span className="cv-copy-percentage">
                    {Math.round(props.percentBorrow * 100) / 100}%
                </span>
                <span className="cv-copy-text">
                    {props.copy.status}
                </span>
                {
                    props.isSelected ? (
                        <Icon
                            className="selected-copy-icon"
                            type="check-circle-o"
                        />) : null
                }
            </span>
            <span className={props.isWinner ? 'cv-copy-percent-chart winner' : 'cv-copy-percent-chart'}
                style={{ width: props.percentBorrow + '%' }}>
            </span>
        </div>
    );
}


export default Book;