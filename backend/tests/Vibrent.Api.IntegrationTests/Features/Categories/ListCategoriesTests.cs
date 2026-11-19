using System.Net;
using System.Net.Http.Json;
using Shouldly;
using Vibrent.Api.Features.Categories.ListCategories;

namespace Vibrent.Api.IntegrationTests.Features.Categories;

[Collection(ApiFixtureDefinition.Name)]
public sealed class ListCategoriesTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnSeededCategoriesOrderedByName_When_UserIsSignedIn()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        var categories = (await client.GetFromJsonAsync<List<CategoryResponse>>("/categories")).ShouldNotBeNull();

        categories.Count.ShouldBe(5);
        categories.Select(category => category.Name).ShouldBe(categories.Select(category => category.Name).Order(StringComparer.Ordinal));
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TokenIsMissing()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/categories", UriKind.Relative));

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}
