export const mockUsers = [
  {
    id: "donor-1",
    name: "Boulangerie Bistro",
    email: "contact@boulangeriebistro.com",
    role: "donor",
    organization: "Boulangerie Bistro #382",
    phone: "(415) 555-0142",
    avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "donor-2",
    name: "Artisan Kitchen & Catering",
    email: "events@artisankitchen.com",
    role: "donor",
    organization: "Artisan Kitchen & Catering",
    phone: "(415) 555-0189",
    avatar: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "donor-3",
    name: "Whole Orchard Organics",
    email: "supply@wholeorchard.com",
    role: "donor",
    organization: "Whole Orchard Organics",
    phone: "(415) 555-0177",
    avatar: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "donor-4",
    name: "Harbor Fish & Seafood",
    email: "dock@harborfish.com",
    role: "donor",
    organization: "Harbor Fish & Fresh Market",
    phone: "(415) 555-0133",
    avatar: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "donor-5",
    name: "Sweet Flour Bakery",
    email: "info@sweetflour.com",
    role: "donor",
    organization: "Sweet Flour Bakery",
    phone: "(415) 555-0166",
    avatar: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "donor-6",
    name: "Harvest Hotel Banquets",
    email: "banquets@harvesthotel.com",
    role: "donor",
    organization: "Harvest Hotel Banquets",
    phone: "(415) 555-0199",
    avatar: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "vol-1",
    name: "Marcus T.",
    email: "marcus.t@foodrelay.org",
    role: "volunteer",
    organization: "Bay Area Food Runners",
    phone: "(415) 555-0210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "vol-2",
    name: "Sarah Jenkins",
    email: "sarah.j@districtfleet.org",
    role: "volunteer",
    organization: "District Central Fleet",
    phone: "(415) 555-0244",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "vol-3",
    name: "Elena Rostova",
    email: "elena.r@suburbanhub.org",
    role: "volunteer",
    organization: "Suburban Hub Dispatch",
    phone: "(415) 555-0277",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "admin-1",
    name: "Sarah Dispatcher",
    email: "admin@freshrelay.org",
    role: "admin",
    organization: "Central Hub Dispatch",
    phone: "(415) 555-0000",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  }
];

export function getInitialDonations() {
  const now = new Date();
  
  return [
    {
      id: "DON-4082",
      donor_id: "donor-2",
      food_type: "Hot Prepared Trays (Halal / Veg)",
      category: "Hot Meals",
      quantity: 120,
      quantity_unit: "lbs",
      servings: 95,
      dietary_flags: JSON.stringify(["Keep Heated", "Vegetarian", "Halal Certified"]),
      pickup_address: "742 Evergreen Terrace, Bay 3 Loading Dock, San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
      pickup_instructions: "Park in designated yellow bay #2 behind the alley roll-up door. Buzz buzzer on left if unattended. Requires thermal insulation box.",
      expiry_time: new Date(now.getTime() + 48 * 60 * 1000), // 48 mins from now (Urgent)
      status: "claimed",
      volunteer_id: "vol-1",
      created_at: new Date(now.getTime() - 30 * 60 * 1000)
    },
    {
      id: "DON-4083",
      donor_id: "donor-3",
      food_type: "Seasonal Apples & Crisp Leafy Greens",
      category: "Raw Produce",
      quantity: 340,
      quantity_unit: "lbs",
      servings: 280,
      dietary_flags: JSON.stringify(["Fresh Harvested", "Vegetarian", "Nut-Free"]),
      pickup_address: "1050 Market St, Eastside Distribution Warehouse, San Francisco, CA",
      latitude: 37.7818,
      longitude: -122.4112,
      pickup_instructions: "Van or large trunk recommended. Check in with warehouse manager Dave at Gate B.",
      expiry_time: new Date(now.getTime() + 3.25 * 3600 * 1000), // 3h 15m from now
      status: "available",
      volunteer_id: null,
      created_at: new Date(now.getTime() - 15 * 60 * 1000)
    },
    {
      id: "DON-4084",
      donor_id: "donor-4",
      food_type: "Chilled Fresh Seafood & Chowders",
      category: "Dairy & Chilled",
      quantity: 65,
      quantity_unit: "lbs",
      servings: 50,
      dietary_flags: JSON.stringify(["Refrigerated (<41°F)", "Cool Chain Strict"]),
      pickup_address: "Pier 39 Dock C, Marina Pier Market, San Francisco, CA",
      latitude: 37.8086,
      longitude: -122.4098,
      pickup_instructions: "Vacuum sealed packages. Ice packs ready. Ring doorbell at side security office.",
      expiry_time: new Date(now.getTime() + 1.16 * 3600 * 1000), // 1h 10m from now (Urgent)
      status: "picked_up",
      volunteer_id: "vol-2",
      created_at: new Date(now.getTime() - 60 * 60 * 1000)
    },
    {
      id: "DON-4085",
      donor_id: "donor-5",
      food_type: "Assorted Pastries & Sourdough Bread",
      category: "Baked Goods",
      quantity: 80,
      quantity_unit: "lbs",
      servings: 110,
      dietary_flags: JSON.stringify(["Nut-Free", "Pre-bagged", "Easy transport"]),
      pickup_address: "520 Valencia St, North Village Plaza, San Francisco, CA",
      latitude: 37.7645,
      longitude: -122.4215,
      pickup_instructions: "Pre-bagged in compact boxes. Front register counter handoff. Ask for Chef Marco.",
      expiry_time: new Date(now.getTime() + 4.5 * 3600 * 1000), // 4h 30m from now
      status: "available",
      volunteer_id: null,
      created_at: new Date(now.getTime() - 10 * 60 * 1000)
    },
    {
      id: "DON-4086",
      donor_id: "donor-6",
      food_type: "Prepared Dinner Trays (Refrigerated)",
      category: "Hot Meals",
      quantity: 320,
      quantity_unit: "lbs",
      servings: 250,
      dietary_flags: JSON.stringify(["Refrigerated", "Halal Certified"]),
      pickup_address: "333 O'Farrell St, St. Jude Shelter Dropoff, San Francisco, CA",
      latitude: 37.7858,
      longitude: -122.4089,
      pickup_instructions: "Signed & delivered to St. Jude Shelter by Carla R.",
      expiry_time: new Date(now.getTime() + 8 * 3600 * 1000),
      status: "delivered",
      volunteer_id: "vol-3",
      created_at: new Date(now.getTime() - 120 * 60 * 1000),
      delivered_at: new Date(now.getTime() - 15 * 60 * 1000)
    },
    {
      id: "DON-4087",
      donor_id: "donor-1",
      food_type: "Fresh Croissants & Baguettes",
      category: "Baked Goods",
      quantity: 45,
      quantity_unit: "lbs",
      servings: 60,
      dietary_flags: JSON.stringify(["Vegetarian", "High Waste Risk"]),
      pickup_address: "128 Post St, Back Alley Loading Bay, San Francisco, CA",
      latitude: 37.7885,
      longitude: -122.4036,
      pickup_instructions: "Enter through back alley, ring buzzer #4 for Chef Marco.",
      expiry_time: new Date(now.getTime() + 42 * 60 * 1000), // 42 mins left
      status: "available",
      volunteer_id: null,
      created_at: new Date(now.getTime() - 5 * 60 * 1000)
    }
  ];
}
