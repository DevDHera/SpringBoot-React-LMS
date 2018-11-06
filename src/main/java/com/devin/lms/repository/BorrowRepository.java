package com.devin.lms.repository;

import com.devin.lms.model.Borrow;
import com.devin.lms.model.CopyBorrowCount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRepository extends JpaRepository<Borrow, Long> {
    @Query("SELECT NEW com.devin.lms.model.CopyBorrowCount(b.copy.id, count(b.id)) FROM Borrow b WHERE b.book.id in :bookIds GROUP BY b.copy.id")
    List<CopyBorrowCount> countByBookIdInGroupByCopyId(@Param("bookIds") List<Long> bookIds);

    @Query("SELECT NEW com.devin.lms.model.CopyBorrowCount(b.copy.id, count(b.id)) FROM Borrow b WHERE b.book.id = :bookId GROUP BY b.copy.id")
    List<CopyBorrowCount> countByBookIdGroupByCopyId(@Param("bookId") Long bookId);

    @Query("SELECT b FROM Borrow b where b.user.id = :userId and b.book.id in :bookIds")
    List<Borrow> findByUserIdAndBookIdIn(@Param("userId") Long userId, @Param("bookIds") List<Long> bookIds);

    @Query("SELECT b FROM Borrow b where b.user.id = :userId and b.book.id = :bookId")
    Borrow findByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);

    @Query("SELECT COUNT(b.id) from Borrow b where b.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT b.book.id FROM Borrow b WHERE b.user.id = :userId")
    Page<Long> findBorrowedBookIdsByUserId(@Param("userId") Long userId, Pageable pageable);
}
