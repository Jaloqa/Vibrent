using FluentValidation;
using MediatR;
using Shouldly;
using Vibrent.Api.Behaviors;

namespace Vibrent.Api.UnitTests.Behaviors;

public sealed class ValidationBehaviorTests
{
    private readonly ValidationBehavior<TestRequest, string> _behavior = new([new TestRequestValidator()]);

    [Fact]
    public async Task Should_ThrowValidationException_When_RequestIsInvalid()
    {
        var nextCalled = false;

        await Should.ThrowAsync<ValidationException>(() => _behavior.Handle(
            new TestRequest(string.Empty),
            _ =>
            {
                nextCalled = true;
                return Task.FromResult("ok");
            },
            CancellationToken.None));

        nextCalled.ShouldBeFalse();
    }

    [Fact]
    public async Task Should_CallNext_When_RequestIsValid()
    {
        var response = await _behavior.Handle(
            new TestRequest("Vibrent"),
            _ => Task.FromResult("ok"),
            CancellationToken.None);

        response.ShouldBe("ok");
    }

    public sealed record TestRequest(string Name) : IRequest<string>;

    public sealed class TestRequestValidator : AbstractValidator<TestRequest>
    {
        public TestRequestValidator() => RuleFor(request => request.Name).NotEmpty();
    }
}
