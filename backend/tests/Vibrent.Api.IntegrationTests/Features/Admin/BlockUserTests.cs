using System.Net;
using Shouldly;
using Vibrent.Api.IntegrationTests.Features.Applications;

namespace Vibrent.Api.IntegrationTests.Features.Admin;

[Collection(ApiFixtureDefinition.Name)]
public sealed class BlockUserTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_RejectExistingTokenAndLogin_When_UserIsBlocked()
    {
        using var admin = await factory.SignedInAdminAsync();
        var email = ApiClientExtensions.UniqueEmail();
        using var participant = factory.CreateClient();
        participant.Authorize(await participant.RegisterAndGetTokenAsync(email));
        var participantId = await participant.GetMyIdAsync();

        using var response = await admin.PostAsync($"/admin/users/{participantId}/block", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        using var profile = await participant.GetAsync("/users/me");
        profile.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        using var login = await participant.LoginAsync(email, ApiClientExtensions.DefaultPassword);
        (await login.ReadProblemCodeAsync()).ShouldBe("Auth.UserBlocked");
    }

    [Fact]
    public async Task Should_RestoreAccess_When_UserIsUnblocked()
    {
        using var admin = await factory.SignedInAdminAsync();
        using var participant = await factory.SignedInClientAsync();
        var participantId = await participant.GetMyIdAsync();
        (await admin.PostAsync($"/admin/users/{participantId}/block", content: null)).EnsureSuccessStatusCode();

        using var response = await admin.PostAsync($"/admin/users/{participantId}/unblock", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        using var profile = await participant.GetAsync("/users/me");
        profile.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Should_ReturnCannotBlockAdmin_When_TargetIsAdmin()
    {
        using var admin = await factory.SignedInAdminAsync();
        using var otherAdmin = await factory.SignedInAdminAsync();

        using var response = await admin.PostAsync($"/admin/users/{await otherAdmin.GetMyIdAsync()}/block", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("User.CannotBlockAdmin");
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_UserDoesNotExist()
    {
        using var admin = await factory.SignedInAdminAsync();

        using var response = await admin.PostAsync($"/admin/users/{Guid.CreateVersion7()}/block", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("User.NotFound");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_CallerIsNotAdmin()
    {
        using var participant = await factory.SignedInClientAsync();
        using var target = await factory.SignedInClientAsync();

        using var response = await participant.PostAsync($"/admin/users/{await target.GetMyIdAsync()}/block", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}
