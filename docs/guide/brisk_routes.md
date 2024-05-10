# Brisk routes

To add titles to [brisk routes](https://docs.adonisjs.com/guides/basics/routing#briskroute), you need to call the `title` method after `render`, `redirect`, `redirectToPath`, or `setHandler` methods. This is because router's `on` method returns a `BriskRoute` instance and the `title` method is added to the `Route` class.
