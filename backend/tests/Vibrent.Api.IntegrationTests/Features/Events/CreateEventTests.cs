using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Shouldly;
using Vibrent.Api.Common;
using Vibrent.Api.Features.Events;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Events;

[Collection(ApiFixtureDefinition.Name)]
public sealed class CreateEventTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_CreateActiveEventOwnedByCaller_When_DataIsValid()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var organizerId = await client.GetMyIdAsync();

        using var response = await client.PostAsJsonAsync("/events", ValidRequest(capacity: 6) with { Title = "  Chess  " });

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var created = await response.ReadAsAsync<EventResponse>();
        response.Headers.Location.ShouldBe(new Uri($"/events/{created.Id}", UriKind.Relative));
        created.OrganizerId.ShouldBe(organizerId);
        created.Title.ShouldBe("Chess");
        created.CategoryName.ShouldBe("Gry planszowe");
        created.Capacity.ShouldBe(6);
        created.FreeSeats.ShouldBe(6);
        created.Status.ShouldBe(EventState.Active);
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_EventStartsInThePast()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.PostAsJsonAsync("/events", ValidRequest(startsAt: DateTimeOffset.UtcNow.AddHours(-1)));

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("errors").TryGetProperty("StartsAt", out _).ShouldBeTrue();
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_CapacityIsZero()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.PostAsJsonAsync("/events", ValidRequest(capacity: 0));

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("errors").TryGetProperty("Capacity", out _).ShouldBeTrue();
    }

    [Fact]
    public async Task Should_ReturnCategoryNotFound_When_CategoryDoesNotExist()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.PostAsJsonAsync("/events", ValidRequest(categoryId: Guid.CreateVersion7()));

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        (await response.ReadProblemCodeAsync()).ShouldBe("Category.NotFound");
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TokenIsMissing()
    {
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/events", ValidRequest());

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}
