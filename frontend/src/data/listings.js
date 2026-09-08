import listingImg1 from '../assets/M-M_003.jpg';
import listingImg2 from '../assets/M-M_013.jpg';
import listingImg3 from '../assets/M-M_017.jpg';
import interior1 from '../assets/image2.jpg';
import interior2 from '../assets/image3.jpg';
import interior3 from '../assets/image4.jpg';

export const listings = [
  {
    id: 'maple-court-suite',
    image: listingImg1,
    gallery: [listingImg1, interior1, interior2, interior3],
    title: 'Maple Court Suite',
    location: 'Downtown District',
    price: '$1,450/mo',
    beds: 2,
    baths: 2,
    size: '950 sqft',
    description:
      'A bright, elegant two-bedroom suite with an open-plan kitchen, private balcony, and floor-to-ceiling windows overlooking the neighborhood. Freshly finished interiors pair modern fixtures with warm, timeless details throughout.',
    amenities: [
      'In-unit laundry',
      'Air conditioning',
      'High-speed internet',
      'Secure parking',
      '24/7 security',
      'Fitted kitchen',
    ],
    neighborhood: [
      { name: 'Riverside Park', distance: '0.4 mi' },
      { name: 'Central Transit Station', distance: '0.6 mi' },
      { name: 'Green Market Grocers', distance: '0.5 mi' },
      { name: 'Downtown Fitness Club', distance: '0.8 mi' },
    ],
    reviews: {
      rating: 4.8,
      count: 30,
      items: [
        { text: 'Bright, quiet, and the balcony view at night is unbeatable. Management was responsive from day one.', name: 'Priya M.' },
        { text: 'Loved the finishes and the walk to the transit station. Would rent here again.', name: 'James O.' },
      ],
    },
    lease: { length: '12 months', deposit: "1 month's rent", pets: 'Cats & dogs welcome', moveIn: 'Available now' },
  },
  {
    id: 'the-willow-loft',
    image: listingImg2,
    gallery: [listingImg2, interior3, interior2, interior1],
    title: 'The Willow Loft',
    location: 'Riverside Green',
    price: '$1,890/mo',
    beds: 3,
    baths: 2,
    size: '1,240 sqft',
    description:
      'A spacious three-bedroom loft designed for family living, featuring an open-concept living and dining area, a home theater-style lounge, and a private entrance with dedicated parking.',
    amenities: [
      'In-unit laundry',
      'Air conditioning',
      'High-speed internet',
      'Secure parking',
      '24/7 security',
      'Home theater lounge',
      'Private balcony',
    ],
    neighborhood: [
      { name: 'Riverside Green Park', distance: '0.2 mi' },
      { name: 'Willow Loft Market', distance: '0.3 mi' },
      { name: 'Riverside Bus Stop', distance: '0.5 mi' },
      { name: 'Family Wellness Clinic', distance: '0.9 mi' },
    ],
    reviews: {
      rating: 4.9,
      count: 22,
      items: [
        { text: 'Plenty of room for the kids and the lounge is perfect for movie nights. Parking is secure and easy.', name: 'Denise K.' },
        { text: 'The private entrance makes it feel like our own house. Great value for the space.', name: 'Marcus T.' },
      ],
    },
    lease: { length: '12 months', deposit: "1.5 months' rent", pets: 'Cats & dogs welcome', moveIn: 'Available Oct 1' },
  },
  {
    id: 'cedar-heights-studio',
    image: listingImg3,
    gallery: [listingImg3, interior2, interior1, interior3],
    title: 'Cedar Heights Studio',
    location: 'Uptown Village',
    price: '$980/mo',
    beds: 1,
    baths: 1,
    size: '580 sqft',
    description:
      'A cozy, efficient studio perfect for a single resident or couple starting out. Thoughtfully laid out with a compact kitchen, a bright sleeping nook, and large windows that fill the space with natural light.',
    amenities: [
      'Air conditioning',
      'High-speed internet',
      'Secure parking',
      '24/7 security',
      'Fitted kitchenette',
    ],
    neighborhood: [
      { name: 'Uptown Coffee House', distance: '0.1 mi' },
      { name: 'Cedar Heights Transit', distance: '0.4 mi' },
      { name: 'Corner Grocers', distance: '0.3 mi' },
      { name: 'Uptown Village Gym', distance: '0.6 mi' },
    ],
    reviews: {
      rating: 4.7,
      count: 18,
      items: [
        { text: 'Perfect starter place — cozy, bright, and everything is walkable from here.', name: 'Sarah N.' },
        { text: 'Small but never feels cramped. The natural light is amazing in the morning.', name: 'Eric B.' },
      ],
    },
    lease: { length: '6 or 12 months', deposit: "1 month's rent", pets: 'Cats welcome', moveIn: 'Available now' },
  },
];

export function getListingById(id) {
  return listings.find((l) => l.id === id);
}
