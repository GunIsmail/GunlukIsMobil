namespace GunlukIs.Application.Common.Results;

public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }
    public int StatusCode { get; }

    protected Result(bool isSuccess, string? error, int statusCode)
    {
        IsSuccess = isSuccess;
        Error = error;
        StatusCode = statusCode;
    }

    public static Result Success(int statusCode = 200) => new(true, null, statusCode);
    public static Result Failure(string error, int statusCode = 400) => new(false, error, statusCode);

    public static Result<T> Success<T>(T value, int statusCode = 200) => new(value, true, null, statusCode);
    public static Result<T> Failure<T>(string error, int statusCode = 400) => new(default, false, error, statusCode);
}

public class Result<T> : Result
{
    public T? Value { get; }

    internal Result(T? value, bool isSuccess, string? error, int statusCode)
        : base(isSuccess, error, statusCode)
    {
        Value = value;
    }
}
