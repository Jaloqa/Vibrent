using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Vibrent.Api.Features.Auth;

namespace Vibrent.Api.IntegrationTests.Features.Auth;

[Collection(ApiFixtureDefinition.Name)]
public sealed class LoginTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnToken_When_CredentialsAreValid()
    {
        using var client = factory.CreateClient();
        var email = ApiClientExtensions.UniqueEmail();
        await client.RegisterAndGetTokenAsync(email);

        using var response = await client.LoginAsync(email.ToUpperInvariant(), ApiClientExtensions.DefaultPassword);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        (await response.Content.ReadFromJsonAsync<AuthResponse>()).ShouldNotBeNull().AccessToken.ShouldNotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_PasswordIsWrong()
    {
        using var client = factory.CreateClient();
        var email = ApiClientExtensions.UniqueEmail();
        await client.RegisterAndGetTokenAsync(email);

        using var response = await client.LoginAsync(email, "Wrong-password1");

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        (await response.ReadProblemCodeAsync()).ShouldBe("Auth.InvalidCredentials");
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_EmailIsUnknown()
    {
        using var client = factory.CreateClient();

        using var response = await client.LoginAsync(ApiClientExtensions.UniqueEmail(), ApiClientExtensions.DefaultPassword);

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        (await response.ReadProblemCodeAsync()).ShouldBe("Auth.InvalidCredentials");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_UserIsBlocked()
    {
        using var client = factory.CreateClient();
        var email = ApiClientExtensions.UniqueEmail();
        await client.RegisterAndGetTokenAsync(email);
        await using (var dbContext = factory.CreateDbContext())
        {
            var user = await dbContext.Users.SingleAsync(candidate => candidate.Email == email);
            user.Block();
            await dbContext.SaveChangesAsync();
        }

        using var response = await client.LoginAsync(email, ApiClientExtensions.DefaultPassword);

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Auth.UserBlocked");
    }
}
