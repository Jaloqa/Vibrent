using System.Net.Http.Json;
using Shouldly;
using Vibrent.Api.Features.Swipes.SwipeEvent;

namespace Vibrent.Api.IntegrationTests.Features.Applications;

internal static class ApplicationsTestData
{
    public static async Task<HttpClient> SignedInClientAsync(this ApiFactory factory)
    {
        var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        return client;
    }

    public static async Task<Guid> ApplyAsync(this HttpClient participant, Guid eventId)
    {
        using var response = await participant.PostAsJsonAsync($"/events/{eventId}/swipe", new { decision = "Like" });
        response.EnsureSuccessStatusCode();
        return (await response.ReadAsAsync<SwipeResponse>()).ApplicationId.ShouldNotBeNull();
    }

    public static Task<HttpResponseMessage> DecideAsync(this HttpClient organizer, Guid applicationId, string status) =>
        organizer.PatchAsJsonAsync($"/applications/{applicationId}", new { status });

    public static Task<HttpResponseMessage> WithdrawAsync(this HttpClient participant, Guid applicationId) =>
        participant.PatchAsync($"/applications/{applicationId}/withdraw", content: null);
}
