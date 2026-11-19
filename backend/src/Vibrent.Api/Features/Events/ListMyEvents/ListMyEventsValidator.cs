using FluentValidation;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Events.ListMyEvents;

internal sealed class ListMyEventsValidator : AbstractValidator<ListMyEventsQuery>
{
    public ListMyEventsValidator() => this.ValidatePaging();
}
