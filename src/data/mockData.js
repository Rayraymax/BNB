export const mockData = {
  settings: {
    id: "site",
    name: "ALKEY Homes",
    shortName: "ALKEY",
    logoImage: "/assets/brand/alkey-logo.png",
    tagline: "Experience Elegance & Royalty",
    metaDescription:
      "ALKEY Homes offers premium serviced apartments in Roysambu with WhatsApp booking, fast Wi-Fi, self check-in, housekeeping, groceries, laundry and local guest support.",
    about:
      "ALKEY Homes is built for guests who want the comfort of a private apartment with the support of a responsive hospitality team. Our Roysambu stays are thoughtfully prepared for business travel, romantic getaways and relaxed city visits, with clean interiors, convenient services and instant WhatsApp assistance from check-in to check-out.",
    story:
      "We started ALKEY Homes with a simple belief: a stay should feel less like a rental and more like arriving somewhere already prepared for you. Every apartment is professionally managed, carefully cleaned, verified before check-in and supported by a team that treats hospitality as a personal promise.",
    coverImage: "/assets/uploads/alkey-building-background.jpeg",
    coverVideo: "",
    whatsapp: "254728835885",
    phone: "+254 728835885",
    email: "alkeyhomess@gmail.com",
    address: "Roysambu, Nairobi",
    landmark: "Near Thika Road Mall and TRM Drive, Roysambu, Nairobi",
    propertyType: "Serviced apartment",
    mapEmbed: "https://www.google.com/maps?q=Roysambu%20Nairobi&output=embed",
    checkIn: "Flexible self check-in",
    checkOut: "10:00 AM",
    checkInNotes: "Check-in from 2:00 PM. Self check-in instructions are shared after confirmation.",
    houseRules: [
      "No smoking inside the apartment",
      "No parties or events",
      "Quiet hours from 10:00 PM to 7:00 AM",
      "Only registered guests may stay overnight"
    ],
    cancellationPolicy: "Free cancellation up to 48 hours before check-in. Cancellations within 48 hours may be charged one night.",
    childrenPolicy: "Children are welcome when the selected room capacity allows. Contact the owner before adding an extra bed or cot.",
    paymentMethods: ["M-Pesa", "Visa / Mastercard", "Bank transfer", "Cash at check-in"],
    paymentNote: "Guests pay the owner directly. Confirm the final total and payment instructions on WhatsApp before arrival.",
    taxNote: "Rates are shown in Kenyan shillings. Confirm applicable taxes or fees with the owner before payment.",
    whatsappTemplates: {
      booking: "Hello {{shortName}},\nI would like to book {{roomName}}.\nDates: {{startDate}} to {{endDate}}\nGuests: {{guests}}\nEstimated total: KSh {{totalCost}}\nName: {{guestName}}\nNote: {{note}}\nPlease confirm availability and total price.",
      service: "Hello {{shortName}},\nI would like to order: {{serviceName}}.\nKindly share your current menu and pricing.",
      access: "Hello {{guestName}},\nYour booking is confirmed.\n{{propertyName}}\nHouse: {{houseToCheckIn}}\nDirections: {{directions}}\n{{lockboxInstructions}}\nLock box password: {{lockboxPassword}}\nPhase: {{phase}}\nWiFi name: {{wifiName}}\nWiFi password: {{wifiPassword}}\nCheck-in: {{checkInTime}}\nCheck-out: {{checkOutTime}}\n{{checkOutNotes}}\nHouse rules:\n{{houseRules}}\n{{additionalNotes}}"
    },
    socials: {
      instagram: "https://instagram.com/",
      facebook: "https://facebook.com/"
    },
    whyChoose: [
      {
        icon: "bed",
        title: "Beautiful Rooms",
        text: "Modern interiors, premium bedding and apartment comforts designed for rest."
      },
      {
        icon: "shield",
        title: "Safe Property",
        text: "Secure, verified accommodation that is professionally maintained."
      },
      {
        icon: "pin",
        title: "Prime Location",
        text: "Roysambu convenience near malls, food, transport routes and city access."
      },
      {
        icon: "key",
        title: "Self Check-In",
        text: "Clear arrival instructions and flexible entry when your schedule changes."
      },
      {
        icon: "sparkles",
        title: "Housekeeping",
        text: "Fresh, spotless rooms prepared before arrival and serviced on request."
      },
      {
        icon: "wifi",
        title: "Fast Wi-Fi",
        text: "Reliable internet and Smart TV entertainment for work or relaxation."
      },
      {
        icon: "bell",
        title: "Guest Services",
        text: "Laundry, groceries, food delivery, local contacts and pickup support."
      },
      {
        icon: "message",
        title: "Easy Booking",
        text: "Check dates, choose a room and confirm instantly through WhatsApp."
      }
    ],
    stats: [
      { value: "2", label: "featured apartments" },
      { value: "24/7", label: "guest support" },
      { value: "Roysambu", label: "prime location" },
      { value: "Fast", label: "self check-in" }
    ]
  },
  rooms: [
    {
      id: "room-701",
      slug: "room-701",
      name: "Room 701",
      status: "published",
      price: 4500,
      priceLabel: "KSh 4,500/night",
      capacity: 2,
      size: "1-bedroom apartment",
      beds: "Queen bed",
      coverImage: "/assets/uploads/alkey-building-background.jpeg",
      coverVideo: "",
      gallery: ["/assets/uploads/alkey-building-background.jpeg", "/assets/room-garden.svg"],
      description:
        "A warm, modern apartment prepared for easy city stays in Roysambu. Ideal for couples, solo guests and business travel, with fast Wi-Fi, Smart TV, clean linens and WhatsApp support.",
      amenities: ["Queen bed", "Smart TV", "Fast Wi-Fi", "Kitchen access", "Self check-in", "Hot shower", "Secure building"],
      seoTitle: "Room 701 at ALKEY Homes Roysambu",
      seoDescription:
        "Book Room 701 at ALKEY Homes in Roysambu, Nairobi. A modern serviced apartment with Wi-Fi, Smart TV, self check-in and WhatsApp booking."
    },
    {
      id: "room-739",
      slug: "room-739",
      name: "Room 739",
      status: "published",
      price: 5000,
      priceLabel: "KSh 5,000/night",
      capacity: 2,
      size: "1-bedroom premium apartment",
      beds: "Queen bed",
      coverImage: "/assets/uploads/alkey-building-background.jpeg",
      coverVideo: "",
      gallery: ["/assets/uploads/alkey-building-background.jpeg", "/assets/room-ridge.svg"],
      description:
        "Our premium Roysambu apartment for guests who want extra space, a refined finish and a calm base for longer or more private stays. Expect a generous living area, dedicated work corner, fast Wi-Fi and responsive support throughout the stay.",
      amenities: ["Queen bed", "Smart TV", "Fast Wi-Fi", "Kitchen essentials", "Self check-in", "Guest services", "Secure building"],
      seoTitle: "Room 739 at ALKEY Homes Roysambu",
      seoDescription:
        "Book Room 739 at ALKEY Homes in Roysambu, Nairobi. Premium apartment comfort with self check-in, Wi-Fi and direct WhatsApp support."
    }
  ],
  services: [
    {
      id: "svc-coffee-one",
      slug: "koffi-koffi",
      category: "food",
      name: "Koffi Koffi Coffee",
      status: "published",
      priceLabel: "menu pricing",
      coverImage: "/assets/services/koffi-koffi.jpg",
      shortDescription: "Nearby coffee option for guests who want a quick cafe run.",
      description:
        "Order coffee, snacks or cafe items through guest support. We can share the current menu and help coordinate pickup or delivery to your apartment.",
      hours: "Morning to evening",
      contactName: "Koffi Koffi",
      whatsapp: "254100065853",
      items: [
        { name: "Coffee order assistance", price: "menu pricing" },
        { name: "Pickup coordination", price: "on request" }
      ]
    },
    {
      id: "svc-meat",
      slug: "meat-delivery",
      category: "food",
      name: "Meat Delivery",
      status: "published",
      priceLabel: "menu pricing",
      coverImage: "/assets/services/meat-delivery.jpg",
      shortDescription: "Meat delivery contact for guests cooking during longer stays.",
      description:
        "Send your order or shopping note on WhatsApp and guest support will help confirm availability, price and delivery timing.",
      hours: "Daily, subject to vendor availability",
      contactName: "Peter Meat Supply",
      whatsapp: "254117699419",
      items: [
        { name: "Meat order", price: "vendor pricing" },
        { name: "Delivery coordination", price: "on request" }
      ]
    },
    {
      id: "svc-kiosk",
      slug: "kiosk-delivery",
      category: "groceries",
      name: "Kiosk Delivery",
      status: "published",
      priceLabel: "from KSh 200",
      coverImage: "/assets/services/kiosk-delivery.jpg",
      shortDescription: "Quick kiosk essentials delivered around Roysambu.",
      description:
        "Useful for water, snacks, airtime, toiletries and quick essentials. Send your list and we coordinate confirmation before dispatch.",
      hours: "8:00 AM - 10:00 PM",
      contactName: "Local kiosk",
      whatsapp: "254142492113",
      items: [
        { name: "Small essentials run", price: "from KSh 200" },
        { name: "Large essentials run", price: "from KSh 500" }
      ]
    },
    {
      id: "svc-juice",
      slug: "juice-and-smoothies",
      category: "drink",
      name: "Juice & Smoothies",
      status: "published",
      priceLabel: "menu pricing",
      coverImage: "/assets/service-groceries.svg",
      shortDescription: "Fresh juice and smoothie delivery contacts nearby.",
      description:
        "Order fresh juice or smoothies from nearby vendors. Guest support helps confirm current options and delivery timing.",
      hours: "Daily",
      contactName: "Juice vendor",
      whatsapp: "254740612042",
      items: [
        { name: "Fresh juice", price: "menu pricing" },
        { name: "Smoothie", price: "menu pricing" }
      ]
    },
    {
      id: "svc-pizza",
      slug: "pizza-place",
      category: "food",
      name: "Pizza Place",
      status: "published",
      priceLabel: "from KSh 600",
      coverImage: "/assets/service-transfer.svg",
      shortDescription: "Pizza delivery contact for easy meals.",
      description:
        "Use the WhatsApp order button to ask for the latest pizza menu, delivery estimate and current offers.",
      hours: "Lunch to late evening",
      contactName: "Pizza vendor",
      whatsapp: "254140122156",
      items: [
        { name: "Small pizza", price: "from KSh 600" },
        { name: "Large pizza", price: "from KSh 1,200" }
      ]
    },
    {
      id: "svc-liquor",
      slug: "liquor-store",
      category: "drink",
      name: "Liquor Store",
      status: "published",
      priceLabel: "menu pricing",
      coverImage: "/assets/service-cleaning.svg",
      shortDescription: "Nearby liquor store contact for guests.",
      description:
        "Request the current drinks list and delivery timing. Guests must confirm age and availability before delivery.",
      hours: "Subject to legal operating hours",
      contactName: "Liquor store",
      whatsapp: "254784840302",
      items: [
        { name: "Beer and cider", price: "store pricing" },
        { name: "Wine and spirits", price: "store pricing" }
      ]
    },
    {
      id: "svc-hair",
      slug: "hair-drop-water",
      category: "groceries",
      name: "Heri Drop Water",
      status: "published",
      priceLabel: "on request",
      coverImage: "/assets/service-laundry.svg",
      shortDescription: "Bottled drinking water delivered to your apartment.",
      description:
        "Order bottled drinking water for your stay and we will help confirm available sizes, price and delivery timing to the apartment.",
      hours: "Daily, subject to delivery availability",
      contactName: "Heri Drop Water",
      whatsapp: "254745680122",
      items: [
        { name: "Water delivery", price: "on request" }
      ]
    },
    {
      id: "svc-laundry",
      slug: "laundry",
      category: "housekeeping",
      name: "Laundry",
      status: "published",
      priceLabel: "from KSh 500",
      coverImage: "/assets/service-laundry.svg",
      shortDescription: "Laundry pickup and return for longer stays.",
      description:
        "Send a laundry request on WhatsApp. We help coordinate wash, dry, fold and return timing.",
      hours: "8:00 AM - 6:00 PM",
      contactName: "Laundry support",
      whatsapp: "254790928582",
      items: [
        { name: "Wash and fold", price: "from KSh 500" },
        { name: "Ironing", price: "on request" }
      ]
    },
    {
      id: "svc-coffee-two",
      slug: "coffee-shop-two",
      category: "food",
      name: "Break Hub Coffee",
      status: "published",
      priceLabel: "menu pricing",
      coverImage: "/assets/services/coffee-shop-two.jpg",
      shortDescription: "Coffee, breakfast bites and snacks from a nearby cafe.",
      description:
        "Order coffee, breakfast bites or snacks from Break Hub Coffee. Guest support can confirm the current menu and coordinate pickup or delivery.",
      hours: "Daily",
      contactName: "Break Hub",
      whatsapp: "254715684262",
      items: [
        { name: "Coffee and snack order", price: "menu pricing" }
      ]
    },
    {
      id: "svc-cleaning",
      slug: "room-cleaning",
      category: "housekeeping",
      name: "Room Cleaning",
      status: "published",
      priceLabel: "from KSh 800",
      coverImage: "/assets/service-cleaning.svg",
      shortDescription: "A full refresh of the apartment during your stay.",
      description:
        "Fresh linens, bathroom reset, floor cleaning, trash removal and apartment refresh. Best booked the evening before.",
      hours: "8:00 AM - 5:00 PM",
      contactName: "Housekeeping desk",
      whatsapp: "254728835882",
      items: [
        { name: "Standard refresh", price: "KSh 800" },
        { name: "Deep clean", price: "KSh 1,800" },
        { name: "Extra linen change", price: "KSh 500" }
      ]
    },
    {
      id: "svc-transfer",
      slug: "airport-pickup",
      category: "transport",
      name: "Airport Pickup",
      status: "published",
      priceLabel: "from KSh 3,500",
      coverImage: "/assets/service-transfer.svg",
      shortDescription: "Reliable pickup from JKIA or Wilson Airport.",
      description:
        "Share your flight number and landing time. We help coordinate a direct pickup to ALKEY Homes in Roysambu.",
      hours: "24 hours with advance booking",
      contactName: "Transport desk",
      whatsapp: "254728835885",
      items: [
        { name: "JKIA pickup", price: "from KSh 4,500" },
        { name: "Wilson pickup", price: "from KSh 3,500" }
      ]
    }
  ],
  bookings: [
    {
      id: "booking-1",
      roomId: "room-701",
      guestName: "Sample booked stay",
      startDate: "2026-08-02",
      endDate: "2026-08-05",
      status: "confirmed",
      source: "mock"
    },
    {
      id: "booking-2",
      roomId: "room-739",
      guestName: "Sample blocked dates",
      startDate: "2026-08-09",
      endDate: "2026-08-12",
      status: "confirmed",
      source: "mock"
    }
  ],
  calendarSyncs: [],
  roomAccessDetails: {
    "room-701": {
      roomId: "room-701",
      propertyName: "TSAVO APARTMENTS CHECK IN DETAILS",
      houseToCheckIn: "Black Gate",
      directions: "3rd floor, the 1st house on your right hand from the stairs.",
      lockboxInstructions: "Keys are in the lock box.",
      lockboxPassword: "2042",
      phase: "Phase 4",
      wifiName: "Jay Homes",
      wifiPassword: "Jay@2026",
      checkInTime: "2:00 PM",
      checkOutTime: "10.00 AM",
      checkOutNotes: "Extension past check-out time attracts charges.",
      houseRules: [
        "When checking out, kindly ensure everything is switched off.",
        "Return the key in the lockbox.",
        "You are responsible for any damage caused.",
        "Enjoy your stay."
      ],
      additionalNotes: "",
      publicInstructions: "Self check-in instructions and active access credentials are shared privately after confirmation."
    },
    "room-739": {
      roomId: "room-739",
      propertyName: "POYLVIEW ESTATE CHECK IN DETAILS",
      houseToCheckIn: "Black Gate",
      directions: "3rd floor, the 1st house on your right hand from the stairs.",
      lockboxInstructions: "Keys are in the lock box.",
      lockboxPassword: "",
      phase: "Phase 4",
      wifiName: "Jay Homes",
      wifiPassword: "",
      checkInTime: "2:00 PM",
      checkOutTime: "10.00 AM",
      checkOutNotes: "Extension past check-out time attracts charges.",
      houseRules: [
        "When checking out, kindly ensure everything is switched off.",
        "Return the key in the lockbox.",
        "You are responsible for any damage caused.",
        "Enjoy your stay."
      ],
      additionalNotes: "",
      publicInstructions: "Self check-in instructions and active access credentials are shared privately after confirmation."
    }
  },
  testimonials: [
    {
      id: "testimonial-mercy",
      name: "Mercy, Nairobi",
      source: "Guest review",
      date: "2026-06-14",
      quote: "Self check-in was smooth, the apartment was spotless and the host replied quickly on WhatsApp."
    },
    {
      id: "testimonial-brian",
      name: "Brian, Eldoret",
      source: "Guest review",
      date: "2026-05-28",
      quote: "Good location in Roysambu, fast Wi-Fi and easy access to food deliveries. I would book again."
    },
    {
      id: "testimonial-amina",
      name: "Amina, Mombasa",
      source: "Guest review",
      date: "2026-04-19",
      quote: "The services were convenient. Laundry and groceries were handled without me leaving the apartment."
    }
  ],
  inquiries: [
    {
      id: "inq-1",
      type: "service",
      guestName: "Brian Otieno",
      message: "Laundry request for Room 739",
      status: "new",
      createdAt: "2026-07-18T08:30:00.000Z"
    },
    {
      id: "inq-2",
      type: "service",
      guestName: "Nadia Karim",
      message: "Grocery delivery request for Room 701",
      status: "open",
      createdAt: "2026-07-18T09:10:00.000Z"
    }
  ]
};
