using Vibrent.Domain.Common;

namespace Vibrent.Domain.Applications;

public static class ApplicationErrors
{
    public static readonly Error NotFound =
        Error.NotFound("Application.NotFound", "The application was not found.");

    public static readonly Error NotApplicant =
        Error.Forbidden("Application.NotApplicant", "Only the applicant can withdraw this application.");

    public static readonly Error NotPending =
        Error.Conflict("Application.NotPending", "Only pending applications can be accepted or rejected.");

    public static readonly Error CannotWithdraw =
        Error.Conflict("Application.CannotWithdraw", "Only pending or accepted applications can be withdrawn.");
}
