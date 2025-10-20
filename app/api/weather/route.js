import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!city) {
    return NextResponse.json({ error: "Missing city" }, { status: 400 });
  }

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
    );
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`
    );
    const forecastData = await forecastRes.json();

    const formattedForecast = forecastData.list
      .filter((_, index) => index % 8 === 0) // One per day
      .map((entry) => ({
        date: new Date(entry.dt_txt).toLocaleDateString(),
        temp: entry.main.temp.toFixed(0),
        icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`,
        description: entry.weather[0].description,
      }));

    const result = {
      current: {
        name: currentData.name,
        temp: currentData.main.temp.toFixed(0),
        humidity: currentData.main.humidity,
        wind: currentData.wind.speed,
        description: currentData.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`,
      },
      forecast: formattedForecast,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching weather" }, { status: 500 });
  }
}
