using Shouldly;
using Vibrent.Domain.Users;
using static Vibrent.Api.UnitTests.Domain.DomainFactory;

namespace Vibrent.Api.UnitTests.Domain;

public sealed class UserTests
{
    [Fact]
    public void Should_NormalizeEmailAndAssignUserRole_When_Registering()
    {
        var user = User.Register("  Jan.Kowalski@Example.COM ", "hash", "Jan", Now);

        user.Email.ShouldBe("jan.kowalski@example.com");
        user.Role.ShouldBe(UserRole.User);
        user.IsBlocked.ShouldBeFalse();
    }
}
