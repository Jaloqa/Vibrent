using Shouldly;
using Vibrent.Domain.Users;
using static Vibrent.Api.UnitTests.Domain.DomainFactory;

namespace Vibrent.Api.UnitTests.Domain;

public sealed class UserTests
{
    [Fact]
    public void Should_NormalizeEmailAndAssignUserRole_When_Registering()
    {
        var user = User.Register("  Jan.Kowalski@Example.COM ", "Jan", Now);

        user.Email.ShouldBe("jan.kowalski@example.com");
        user.Role.ShouldBe(UserRole.User);
        user.IsBlocked.ShouldBeFalse();
    }

    [Fact]
    public void Should_BlockUser_When_UserIsNotAdmin()
    {
        var user = User.Register("jan@example.com", "Jan", Now);

        var result = user.Block();

        result.IsSuccess.ShouldBeTrue();
        user.IsBlocked.ShouldBeTrue();
    }

    [Fact]
    public void Should_ReturnCannotBlockAdmin_When_UserIsAdmin()
    {
        var admin = User.Register("admin@example.com", "Admin", Now);
        admin.PromoteToAdmin();

        var result = admin.Block();

        result.Error.ShouldBe(UserErrors.CannotBlockAdmin);
        admin.IsBlocked.ShouldBeFalse();
    }
}
