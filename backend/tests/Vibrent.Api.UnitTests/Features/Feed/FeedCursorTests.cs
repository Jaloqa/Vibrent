using Shouldly;
using Vibrent.Api.Features.Feed.GetFeed;

namespace Vibrent.Api.UnitTests.Features.Feed;

public sealed class FeedCursorTests
{
    [Fact]
    public void Should_RestoreCursor_When_EncodedValueIsDecoded()
    {
        var cursor = new FeedCursor(new DateTimeOffset(2026, 12, 1, 18, 30, 0, TimeSpan.Zero), Guid.CreateVersion7());

        FeedCursor.TryDecode(cursor.Encode(), out var decoded).ShouldBeTrue();

        decoded.ShouldBe(cursor);
    }

    [Theory]
    [InlineData("not-a-cursor")]
    [InlineData("")]
    [InlineData("MTIzNDU")]
    public void Should_RejectCursor_When_ValueIsMalformed(string value)
    {
        FeedCursor.TryDecode(value, out _).ShouldBeFalse();
    }
}
