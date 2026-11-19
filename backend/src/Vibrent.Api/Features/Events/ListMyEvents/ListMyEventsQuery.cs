using MediatR;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Events.ListMyEvents;

public sealed record ListMyEventsQuery(Guid OrganizerId, int Page, int PageSize)
    : IRequest<PagedResponse<MyEventResponse>>, IPagedQuery;
