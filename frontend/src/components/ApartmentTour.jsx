import exteriorGate from '../assets/image5.jpg';
import livingRoom from '../assets/image4.jpg';
import diningTv from '../assets/image2.jpg';
import kitchen from '../assets/image3.jpg';
import driveway from '../assets/image6.jpg';
import './ApartmentTour.css';

const spaces = [
  {
    name: 'The Building',
    caption: 'Modern exterior at night',
    image: exteriorGate,
  },
  {
    name: 'Living Room',
    caption: 'Comfortable lounge seating',
    image: livingRoom,
  },
  {
    name: 'Dining & TV Area',
    caption: 'Open dining with entertainment',
    image: diningTv,
  },
  {
    name: 'Kitchen',
    caption: 'Fully equipped kitchen',
    image: kitchen,
  },
  {
    name: 'Parking & Driveway',
    caption: 'Secure private parking',
    image: driveway,
  },
];

export default function ApartmentTour() {
  return (
    <section id="gallery" className="tour">
      <div className="container">
        <div className="section-head tour__head">
          <h2 className="section-title">Take a Tour of Crystal Apartment</h2>
          <p>Step inside and see every space that makes Crystal Apartment feel like home.</p>
        </div>

        <div className="tour__row">
          {spaces.map((space) => (
            <div className="tour__card" key={space.name}>
              <img src={space.image} alt={space.name} />
              <div className="tour__overlay">
                <h4>{space.name}</h4>
                <span>{space.caption}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="tour__dots">
          <span className="tour__dot is-active" />
          <span className="tour__dot" />
        </div>
      </div>
    </section>
  );
}
