import storyImg from '../assets/image4.jpg';
import './OurStory.css';

const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '120+', label: 'Apartments Managed' },
  { value: '500+', label: 'Happy Residents' },
];

export default function OurStory() {
  return (
    <section className="story">
      <div className="container story__grid">
        <div className="story__content">
          <span className="section-tag">Our Story</span>
          <h2 className="section-title">Building Homes, Not Just Apartments</h2>
          <p className="story__lead">
            What started as a single renovated building in Kimihurura has grown into a trusted
            name in Kigali real estate. We still treat every unit like it&apos;s the first &mdash;
            with hands-on management and neighbors who look out for each other.
          </p>

          <div className="story__stats">
            {stats.map((s) => (
              <div className="story__stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="story__image">
          <img src={storyImg} alt="Crystal Apartment living room" />
        </div>
      </div>
    </section>
  );
}
