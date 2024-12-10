import BookingTable from "../../../components/vendor/Tables/BookingTable";
import Layout from "../../../layout/vendor/Layout";

const BookingHistory = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <BookingTable />
      </div>
    </Layout>
  );
};

export default BookingHistory;
