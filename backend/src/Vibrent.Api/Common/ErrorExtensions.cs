using Vibrent.Domain.Common;

namespace Vibrent.Api.Common;

internal static class ErrorExtensions
{
    public static IResult ToProblem(this Error error) => TypedResults.Problem(
        statusCode: error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError,
        },
        title: error.Description,
        extensions: new Dictionary<string, object?> { ["code"] = error.Code });
}
