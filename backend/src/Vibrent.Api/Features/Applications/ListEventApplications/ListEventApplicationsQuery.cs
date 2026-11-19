using MediatR;
using Vibrent.Api.Common.Pagination;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Applications.ListEventApplications;

public sealed record ListEventApplicationsQuery(
    Guid EventId,
    Guid OrganizerId,
    ApplicationStatus? Status,
    int Page,
    int PageSize) : IRequest<Result<PagedResponse<EventApplicationResponse>>>, IPagedQuery;
