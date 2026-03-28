import ListingForm from '../components/ListingForm';

export default function CreateListingPage() {
  return (
    <section>
      <div className="section-heading">
        <h1>Host your space</h1>
        <p>Add a new event venue, office, or storage space for guests to discover.</p>
      </div>
      <ListingForm />
    </section>
  );
}
