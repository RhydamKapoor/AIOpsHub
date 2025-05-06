(() => {
  const weather = tool(
    async ({ city }) => {
      const cityName = city.toLowerCase().replace(/\s+/g, '+');
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${env.OPENWEATHER}`
      );
      return `The temperature in ${city} is ${(
        response.data.main.temp - 273.15
      ).toFixed(2)}°C`;
    },
    {
      name: 'weather',
      description: 'Get the weather of a city',
      schema: z.object({
        city: z
          .string()
          .describe('The city to get the weather of eg: delhi, mumbai, etc.'),
      }),
    }
  );
  global.toolNode = weather;
})();
