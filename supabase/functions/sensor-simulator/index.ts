import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch weather data from Open-Meteo for Cameroon (Yaoundé coordinates)
    const weatherRes = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=3.8480&longitude=11.5021&current=temperature_2m,relative_humidity_2m,precipitation&timezone=Africa/Lagos"
    );
    const weatherData = await weatherRes.json();
    const currentWeather = weatherData.current ?? {};
    const outsideTemp = currentWeather.temperature_2m ?? 28;
    const outsideHumidity = currentWeather.relative_humidity_2m ?? 75;
    const precipitation = currentWeather.precipitation ?? 0;

    // Get all active parcelles
    const { data: parcelles, error: parcelleError } = await supabase
      .from("parcelles")
      .select("id, irrigation_active, culture");

    if (parcelleError) throw parcelleError;
    if (!parcelles || parcelles.length === 0) {
      return new Response(
        JSON.stringify({ message: "Aucune parcelle trouvée", inserted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const inserts: Array<{ parcelle_id: string; temperature: number; humidite_sol: number; humidite_air: number }> = [];

    for (const p of parcelles) {
      // Base temperature influenced by outside weather
      const tempVariation = (Math.random() - 0.5) * 4;
      const temperature = Math.round((outsideTemp + tempVariation) * 100) / 100;

      // Soil humidity: affected by rain, irrigation, and evaporation
      let soilHumidity = 45 + Math.random() * 15;
      if (precipitation > 0) soilHumidity += precipitation * 3;
      if (p.irrigation_active) soilHumidity += 15;
      if (outsideTemp > 32) soilHumidity -= 8;
      soilHumidity = Math.max(20, Math.min(95, soilHumidity));
      soilHumidity = Math.round(soilHumidity * 100) / 100;

      // Air humidity influenced by outside conditions
      let airHumidity = outsideHumidity + (Math.random() - 0.5) * 10;
      if (p.irrigation_active) airHumidity += 5;
      airHumidity = Math.max(30, Math.min(100, airHumidity));
      airHumidity = Math.round(airHumidity * 100) / 100;

      inserts.push({
        parcelle_id: p.id,
        temperature,
        humidite_sol: soilHumidity,
        humidite_air: airHumidity,
      });
    }

    const { data, error } = await supabase
      .from("sensor_data")
      .insert(inserts)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        message: "Données capteurs simulées avec succès",
        inserted: inserts.length,
        weather: { outsideTemp, outsideHumidity, precipitation },
        data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
