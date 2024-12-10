import { useEffect, useState, useMemo } from "react";
import { useSearchContext } from "../../contexts/SearchContext";
import axios from "axios";
import SearchResultsCard from "../../components/vendor/SearchResultsCard";
import Pagination from "../../components/vendor/Pagination";
import HotelTypesFilter from "../../components/vendor/HotelTypesFilter";
import FacilitiesFilter from "../../components/vendor/FacilitiesFilter";
import PriceFilter from "../../components/vendor/PriceFilter";
import { axiosInstance } from "../../config/api/axiosinstance";
import { VendorData } from "../../types/vendorTypes";
import SearchBar from "../../components/vendor/SearchBar";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const Search = () => {
  const search = useSearchContext();
  const [page, setPage] = useState<number>(1);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState<string>("");
  const [hotelData, setHotelData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false); // Toggle filter visibility

  const searchParams = useMemo(
    () => ({
      destination: search.destination,
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      adultCount: search.adultCount.toString(),
      childCount: search.childCount.toString(),
      page: page.toString(),
      types: selectedHotelTypes,
      facilities: selectedFacilities,
      maxPrice: selectedPrice?.toString(),
      sortOption: sortOption,
    }),
    [
      search,
      page,
      selectedHotelTypes,
      selectedFacilities,
      selectedPrice,
      sortOption,
    ]
  );

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append("destination", searchParams.destination || "");
      queryParams.append("checkIn", searchParams.checkIn || "");
      queryParams.append("checkOut", searchParams.checkOut || "");
      queryParams.append("adultCount", searchParams.adultCount || "");
      queryParams.append("childCount", searchParams.childCount || "");
      queryParams.append("page", searchParams.page || "");
      queryParams.append("maxPrice", searchParams.maxPrice || "");
      queryParams.append("sortOption", searchParams.sortOption || "");

      searchParams.facilities.forEach((facility) =>
        queryParams.append("facilities", facility)
      );
      searchParams.types.forEach((type) => queryParams.append("types", type));

      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/api/user/search?${queryParams}`,
          {
            params: queryParams,
          }
        );

        let fetchedHotels: VendorData[] = response.data.data;

        if (sortOption === "pricePerNightAsc") {
          fetchedHotels.sort(
            (a: VendorData, b: VendorData) => a.pricePerNight - b.pricePerNight
          );
        } else if (sortOption === "pricePerNightDesc") {
          fetchedHotels.sort(
            (a: VendorData, b: VendorData) => b.pricePerNight - a.pricePerNight
          );
        }
        console.log("respons....",response)
        setHotelData({ ...response.data, data: fetchedHotels });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Error fetching hotels");
        } else {
          setError("Error fetching hotels");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams, sortOption]);

  const handleHotelTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hotelType = event.target.value;

    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((hotel) => hotel !== hotelType)
    );
  };

  const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const facility = event.target.value;

    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, facility]
        : prevFacilities.filter((prevFacility) => prevFacility !== facility)
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
console.log("hotelData...",hotelData)
  return (
    <div className="space-y-5 mt-20">
      <SearchBar />

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
        {/* Filters Sidebar */}
        <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
          <div className="space-y-5">
            {/* Button to toggle filters on mobile */}
            <button
              className="lg:hidden w-full py-2 bg-gray-800 text-white rounded-md"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              {isFilterVisible ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Filter Section */}
            <div className={`lg:block ${isFilterVisible ? "block" : "hidden"} lg:space-y-5`}>
              <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
                Filter by:
              </h3>
              <HotelTypesFilter
                selectedHotelTypes={selectedHotelTypes}
                onChange={handleHotelTypeChange}
              />
              <FacilitiesFilter
                selectedFacilities={selectedFacilities}
                onChange={handleFacilityChange}
              />
              <PriceFilter
                selectedPrice={selectedPrice}
                onChange={(value?: number) => setSelectedPrice(value)}
              />
            </div>
          </div>
        </div>

        {/* Hotel Search Results */}
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">
              {hotelData?.pagination.total} Hotels found
              {search.destination ? ` in ${search.destination}` : ""}
            </span>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="">Sort By</option>
              <option value="pricePerNightAsc">
                Price Per Night (low to high)
              </option>
              <option value="pricePerNightDesc">
                Price Per Night (high to low)
              </option>
            </select>
          </div>

          {hotelData?.data && hotelData.data.length > 0 ? (
            hotelData.data.map((hotel: VendorData) => (
              <SearchResultsCard key={hotel._id} hotel={hotel} />
            ))
          ) : (
            <div>No hotels found</div>
          )}

          <Pagination
            page={hotelData?.pagination.page || 1}
            pages={hotelData?.pagination.pages || 1}
            onPageChange={(page) => setPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
