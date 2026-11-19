using System.Net;
using Shouldly;
using Vibrent.Api.Common.Pagination;
using Vibrent.Api.Features.Admin.ListUsers;
using Vibrent.Api.IntegrationTests.Features.Applications;
using Vibrent.Domain.Users;

namespace Vibrent.Api.IntegrationTests.Features.Admin;

[Collection(ApiFixtureDefinition.Name)]
public sealed class ListUsersTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_FindUserCaseInsensitively_When_SearchMatchesPartOfEmail()
    {
        using var admin = await factory.SignedInAdminAsync();
        var email = ApiClientExtensions.UniqueEmail();
        using var participant = factory.CreateClient();
        await participant.RegisterAndGetTokenAsync(email);

        using var response = await admin.GetAsync($"/admin/users?search={email[..12].ToUpperInvariant()}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var user = (await response.ReadAsAsync<PagedResponse<AdminUserResponse>>()).Items.ShouldHaveSingleItem();
        user.Email.ShouldBe(email);
        user.Role.ShouldBe(UserRole.User);
        user.IsBlocked.ShouldBeFalse();
    }

    [Fact]
    public async Task Should_TreatWildcardsLiterally_When_SearchContainsPercentSign()
    {
        using var admin = await factory.SignedInAdminAsync();

        using var response = await admin.GetAsync("/admin/users?search=%25");

        (await response.ReadAsAsync<PagedResponse<AdminUserResponse>>()).TotalCount.ShouldBe(0);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_CallerIsNotAdmin()
    {
        using var participant = await factory.SignedInClientAsync();

        using var response = await participant.GetAsync("/admin/users");

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}
