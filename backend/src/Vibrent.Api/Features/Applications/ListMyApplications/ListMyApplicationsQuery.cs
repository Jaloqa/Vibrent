using MediatR;
using Vibrent.Api.Common.Pagination;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.ListMyApplications;

public sealed record ListMyApplicationsQuery(Guid UserId, ApplicationStatus? Status, int Page, int PageSize)
    : IRequest<PagedResponse<MyApplicationResponse>>, IPagedQuery;
