import { Text, Image, View, Button, ImageBackground, TextInput, Pressable, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import "../global.css"
import { MagnifyingGlassIcon, CalendarDaysIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { debounce } from 'lodash'
import { fetchlocation, fetchWeatherForecast } from "../api/weather"
import { weatherImages } from "@/constants";
import * as Progress from 'react-native-progress'
import { storeData, getData } from "../constants/asyncStorage";

export default function Index() {
  
const { width, height } = Dimensions.get("window");
// console.log(width+" "+height)

  const router = useRouter();
  const handleNavigation = () => {
    console.log("Navigating to Profile..."); // Debugging log
    router.push("/profile");
  };
  // STATES 
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocation] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);


  function handlelocation(loc) {
    setLocation([]); 
    setShowSearch(false);  
    setLoading(true);  
  
    fetchWeatherForecast({
      cityName: loc.name, 
      days: '14',  
    }).then(data => {
      setWeather(data);  
      setLoading(false);  
      storeData('city', loc.name); 
    }).catch(error => {
      console.error("Error fetching location:", error);  
    });
  }

  function handleSearch(e) {
    if (e.length >= 3) {
      fetchlocation({ cityName: e })  
        .then(data => {
          // console.log(data);
          setLocation(data); 
        })
        .catch(error => {
          console.error("Error fetching location:", error);  
        });
    }
  }

  const debouncedSearch = useCallback(
    debounce((e) => handleSearch(e), 300), []
  );

  function handleTextDebounce(e) {
    debouncedSearch(e);
  }

const fetchMyWeatherData = async () => {
  const myCity = await getData('city'); 
  let cityName = "Mumbai";  
  if (myCity) cityName = myCity;

  setLoading(true);  

  fetchWeatherForecast({
    cityName,  
    days: '14',  
  }).then(data => {
    setWeather(data);  
    setLoading(false);  
  }).catch((error) => {
    setLoading(false);  
    console.error("Error fetching weather data:", error);  
  });
};
  useEffect(() => {
    fetchMyWeatherData();
  }, [])

  const { current, location } = weather;
  return (
    <View style={{ flex: 1, marginTop:1 }}>
       <StatusBar style="dark" backgroundColor="#2C3930" />
      <ImageBackground
        source={require("../assets/images/weather-app-assets/bg.png")}
        // source={require("../assets/images/4.png")}
        blurRadius={50}
        resizeMode="cover"
        style={{ position: "absolute", flex: 1, justifyContent: "center", alignItems: "center", width: width*1, height: "100%" }}
      />
      {
        loading ? (
          <View className="flex-1 flex-row justify-center items-center">
            <Text className="text-white text-4xl">
              <Progress.CircleSnail thinckness={15} size={140} color="#0bb3b2" />
            </Text>
          </View>
        ) : (
          <SafeAreaView style={{ flex: 1 }}>
            {/* Search Section */}
            <View style={{ height: height*0.07, borderRadius: 50 }} className="mx-8 relative z-50">
              <View className="flex-row justify-center  items-center rounded-full"
              >
                {/* Search Bar */}
                {
                  showSearch && (
                    <TextInput
                      onChangeText={(e) => handleTextDebounce(e)}
                      placeholder="Search City"
                      placeholderTextColor={"lightgray"}
                      style={{ backgroundColor: showSearch && "rgba(255,255,255,0.5)", height: height*0.05, paddingVertical: 1, paddingHorizontal: 20, justifyContent: "center", fontSize: 15, color: "black", flex: 1, borderRadius: 50, transitionDelay: 1000, transitionDuration: 500 }}
                    />
                  )
                }
                {/* Search Button */}
                <TouchableOpacity
                  style={{ backgroundColor: "rgba(255,255,255,0.5)", padding: 10, borderRadius: 50, margin: 10, width: width*0.12, height: height*0.05, alignItems: "center", justifyContent: "center" }}
                  onPress={() => setShowSearch(!showSearch)}
                >
                  <MagnifyingGlassIcon size={25} color="black" />
                </TouchableOpacity>
              </View>

              {
                locations.length > 0 && showSearch ? (
                  <View style={{ height: "auto", backgroundColor: "rgba(255,255,255,0.9)" }} className="absolute top-20 w-full z-50 rounded-3xl">
                    {
                      locations.map((item, index) => {
                        let showBorder = index + 1 === locations.length;
                        let borderClass = showBorder ? 'border-b-2 border-gray-400' : "";
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handlelocation(item)}
                            className={"flex-row items-center border-0 p-3 px-4 mb-1 border-b-2" + borderClass}
                          >
                            <MapPinIcon size={20} color="black" />
                            <Text className="text-black font-bold text-lg ml-2">{item?.name}, {item?.country}</Text>
                          </TouchableOpacity>

                        )
                      })
                    }
                  </View>
                ) : null
              }
            </View>

            {/* Forcast Section */}
            <View className="m-8 flex justify-around flex-">
              {/* location */}
              <Text style={{fontSize:width*0.06}} className="text-white text-center font-bold">
                {location?.name},
                <Text style={{fontSize:width*0.04}} className="font-semibold text-gray-200"> {" " + location?.country}</Text>
              </Text>

              {/* Weather Image */}
              <View style={{ height:height*0.3}} className="justify-center items-center flex-row">
                <Image
                  source={weatherImages[current?.condition?.text]}
                  style={{width:width*0.67, height:height*0.3}}
                />
              </View>

              {/* Temperature */}
              <View className=" m-5">
                <Text style={{fontSize:width*0.11}} className="text-center font-bold text-white ml-5">{current?.temp_c}&#176;</Text>
                <Text style={{fontSize:width*0.05}} className="text-center text-white text-xl ml-5">{current?.condition?.text}</Text>
              </View>

              {/* More stats */}
              <View className="flex gap-2">
                <View className="flex-row justify-between">
                  <View  className="flex-row space-x-2 items-center">
                    <Image
                      source={require("../assets/images/images/wind.png")}
                      className="h-10 w-10"
                    />
                    <Text style={{fontSize:width*0.05}} className=" text-white font-semibold" > {current?.wind_kph} km/h</Text>
                  </View>

                  <View className="flex-row space-x-2 mr-8 items-center">
                    <Image
                      source={require("../assets/images/images/drop.png")}
                      className="h-10 w-10"
                    />
                    <Text style={{fontSize:width*0.05}} className="text-xl text-white font-semibold ml-5" > {current?.humidity}%</Text>
                  </View>
                </View>

                <View className="flex-row  justify-between mt-3">
                  <View className="flex-row space-x-2 items-center">
                    <Image
                      source={require("../assets/images/images/sunrise.png")}
                      className="h-10 w-10"
                    />
                    <Text style={{fontSize:width*0.05}} className="text-xl text-white font-semibold" > {weather?.forecast?.forecastday[0].astro?.sunrise}</Text>
                  </View>

                  <View className="flex-row space-x-2 items-center">
                    <Image
                      source={require("../assets/images/images/sunset.png")}
                      className="h-10 w-10"
                    />
                    <Text style={{fontSize:width*0.05}} className="text-xl text-white font-semibold " > {weather?.forecast?.forecastday[0].astro?.sunset}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Forecast for next 3 days */}
            <View className="mb-2 space-y-3">
              <View style={{padding:10}} className="flex-row items-center ml-5 gap-5">
                <CalendarDaysIcon size="22" color="white" />
                <Text style={{fontSize:width*0.05}} className="text-white font-bold text-2xl">
                  Daily Forecast
                </Text>
              </View>
              <View
                // horizontal
                // contentContainerStyle={{ padding: 10 }}
                // showsHorizontalScrollIndicator={false}
                style={{flex:1, flexDirection:"row", padding:5, gap:17}}
              >
                {

                  weather?.forecast?.forecastday?.map((item, index) => {
                    let date = new Date(item.date);
                    let options = { weekday: 'long' };
                    let dayName = date.toLocaleDateString('en-US', options)
                    dayName = dayName.split(',')[0]
                    return (
                      <View  className="flex justify-center items-center rounded-3xl py-8 space-y-1"
                        style={{ backgroundColor: "rgba(255,255,255,0.15)" ,width:width*0.30, height:height*0.19}}
                        key={index}
                      >
                        <Image source={(weatherImages[item?.day?.condition?.text])?weatherImages[item?.day?.condition?.text]:require("../assets/images/weather-app-assets/partlycloudy.png")}
                          className="h-12 w-12"
                        />
                        <Text style={{fontSize:width*0.05}} className="text-white text-xl p-2">{dayName}</Text>
                        <Text style={{fontSize:width*0.06}} className="text-wrap text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                      </View>
                    )
                  })
                }
              </View>
            </View>
          </SafeAreaView>
        )
      }
    </View>
  );
}
