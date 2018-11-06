package com.devin.lms.model;

public class CopyBorrowCount {
    private Long copyId;
    private Long borrowCount;

    public CopyBorrowCount(Long copyId, Long borrowCount) {
        this.copyId = copyId;
        this.borrowCount = borrowCount;
    }

    public Long getCopyId() {
        return copyId;
    }

    public void setCopyId(Long copyId) {
        this.copyId = copyId;
    }

    public Long getBorrowCount() {
        return borrowCount;
    }

    public void setBorrowCount(Long borrowCount) {
        this.borrowCount = borrowCount;
    }
}
