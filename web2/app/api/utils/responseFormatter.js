/*
---------------------------------------------------
Project:        FundingProject
Date:           Oct 26, 2024
Author:         Faizan
---------------------------------------------------

Description:
Generic response format for all API's
---------------------------------------------------
*/

const responseFormatter = (status, message, error, data) => {
    return {
        status,
        message,
        error: error || null, // Set error to null if not provided
        data: data || null,   // Set data to null if not provided
    };
};

export default responseFormatter;
