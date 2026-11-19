using System.Net;
using System.Net.Http.Json;
using Shouldly;
using Vibrent.Api.Features.Users;

namespace Vibrent.Api.IntegrationTests.Features.Users;

[Collection(ApiFixtureDefinition.Name)]
public sealed class GetProfileTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnProfile_When_TokenIsValid()
    {
        using var client = factory.CreateClient();
        var email = ApiClientExtensions.UniqueEmail();
        client.Authorize(await client.RegisterAndGetTokenAsync(email));

        using var response = await client.GetAsync(new Uri("/users/me", UriKind.Relative));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var profile = (await response.Content.ReadFromJsonAsync<ProfileResponse>()).ShouldNotBeNull();
        profile.Email.ShouldBe(email);
        profile.DisplayName.ShouldBe("Test user");
        profile.Role.ShouldBe("User");
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoTokenIsSent()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/users/me", UriKind.Relative));

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TokenIsTampered()
    {
        using var client = factory.CreateClient();
        var token = await client.RegisterAndGetTokenAsync();
        client.Authorize(token[..^4] + "AAAA");

        using var response = await client.GetAsync(new Uri("/users/me", UriKind.Relative));

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}
