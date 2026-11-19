using System.Net;
using System.Net.Http.Json;
using Shouldly;

namespace Vibrent.Api.IntegrationTests.Features.Auth;

[Collection(ApiFixtureDefinition.Name)]
public sealed class ChangePasswordTests(ApiFactory factory)
{
    private const string NewPassword = "N3w-secret-pass";

    [Fact]
    public async Task Should_AllowLoginOnlyWithNewPassword_When_PasswordIsChanged()
    {
        using var client = factory.CreateClient();
        var email = ApiClientExtensions.UniqueEmail();
        client.Authorize(await client.RegisterAndGetTokenAsync(email));

        using var response = await client.PutAsJsonAsync(
            "/auth/change-password",
            new { currentPassword = ApiClientExtensions.DefaultPassword, newPassword = NewPassword });

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        (await client.LoginAsync(email, ApiClientExtensions.DefaultPassword)).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        (await client.LoginAsync(email, NewPassword)).StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_CurrentPasswordIsWrong()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.PutAsJsonAsync(
            "/auth/change-password",
            new { currentPassword = "Wrong-password1", newPassword = NewPassword });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        (await response.ReadProblemCodeAsync()).ShouldBe("Auth.InvalidCurrentPassword");
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoTokenIsSent()
    {
        using var client = factory.CreateClient();

        using var response = await client.PutAsJsonAsync(
            "/auth/change-password",
            new { currentPassword = ApiClientExtensions.DefaultPassword, newPassword = NewPassword });

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}
