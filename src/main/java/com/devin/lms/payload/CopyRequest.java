package com.devin.lms.payload;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class CopyRequest {
    @NotBlank
    @Size(max = 10)
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
