import { config, collection, singleton, fields } from '@keystatic/core';

/**
 * Lampkey Artery content model.
 *
 * Kyle edits these YAML files directly in the repo; Thor uses the Keystatic UI
 * at /keystatic from his phone. Local storage is the default; switch to GitHub
 * storage (see .env.example) so Thor's edits commit straight to the repo.
 */

const STYLES = [
  { label: 'Black & grey', value: 'black-and-grey' },
  { label: 'Color', value: 'color' },
  { label: 'Illustrative', value: 'illustrative' },
  { label: 'Horror', value: 'horror' },
  { label: 'Playful', value: 'playful' },
  { label: 'Comic style', value: 'comic' },
  { label: 'Woodblock', value: 'woodblock' },
  { label: 'Bio-surreal', value: 'bio-surreal' },
  { label: 'Pinup', value: 'pinup' },
  { label: 'Flash', value: 'flash' },
];

const image = (dir: string, label = 'Image') =>
  fields.image({
    label,
    directory: `public/media/${dir}`,
    publicPath: `/media/${dir}/`,
    validation: { isRequired: true },
  });

const storage =
  process.env.KEYSTATIC_STORAGE === 'github'
    ? ({
        kind: 'github',
        repo: (process.env.KEYSTATIC_GITHUB_REPO ?? 'KyleMix/THORWEBSITE') as `${string}/${string}`,
      } as const)
    : ({ kind: 'local' } as const);

export default config({
  storage,
  ui: {
    brand: { name: 'Lampkey Artery' },
    navigation: {
      'The work': ['works', 'designs', 'products'],
      'Out in the world': ['appearances', 'testimonials', 'socials'],
      'Site': ['settings', 'about', 'booking'],
    },
  },

  collections: {
    works: collection({
      label: 'Works',
      path: 'content/works/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['year', 'type', 'status', 'featured'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        year: fields.integer({ label: 'Year', validation: { min: 2000, max: 2100 } }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Tattoo', value: 'tattoo' },
            { label: 'Design', value: 'design' },
            { label: 'Original', value: 'original' },
            { label: 'Print', value: 'print' },
            { label: 'Live event', value: 'live-event' },
          ],
          defaultValue: 'tattoo',
        }),
        styles: fields.multiselect({ label: 'Styles', options: STYLES }),
        image: image('works'),
        alt: fields.text({
          label: 'Alt text',
          description: 'Describe the piece for people who cannot see it. Required for accessibility and SEO.',
          validation: { isRequired: true },
        }),
        medium: fields.text({ label: 'Medium', description: 'e.g. Tattoo, black & grey · Ink on paper · Giclée print' }),
        placement: fields.text({ label: 'Placement or size', description: 'e.g. Forearm · 11 × 14 in' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Healed', value: 'healed' },
            { label: 'Fresh', value: 'fresh' },
            { label: 'Available', value: 'available' },
            { label: 'Sold', value: 'sold' },
            { label: 'Print available', value: 'print-available' },
          ],
          defaultValue: 'healed',
        }),
        caption: fields.text({
          label: 'Caption (in Thor\'s voice)',
          multiline: true,
          description: 'Short. What it is, what he was going for.',
        }),
        featured: fields.checkbox({ label: 'Show on home page', defaultValue: false }),
        featuredOrder: fields.integer({ label: 'Home page order', description: 'Lower numbers first.', defaultValue: 50 }),
        hero: fields.checkbox({ label: 'Use as home hero', description: 'Only one piece should have this on.', defaultValue: false }),
        span: fields.select({
          label: 'Grid importance',
          description: 'How much room this piece gets in the desktop gallery.',
          options: [
            { label: 'Normal', value: '1' },
            { label: 'Wide', value: '2' },
          ],
          defaultValue: '1',
        }),
        product: fields.relationship({ label: 'Buy: linked shop product', collection: 'products' }),
        design: fields.relationship({ label: 'Started as this design', collection: 'designs' }),
        instagramUrl: fields.url({ label: 'Instagram post' }),
        date: fields.date({ label: 'Date posted' }),
      },
    }),

    designs: collection({
      label: 'Available designs',
      path: 'content/designs/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['status', 'repeatable'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        image: image('designs'),
        alt: fields.text({ label: 'Alt text', validation: { isRequired: true } }),
        note: fields.text({ label: 'Note (in Thor\'s voice)', multiline: true }),
        colorOptions: fields.multiselect({
          label: 'Can be done in',
          options: [
            { label: 'Color', value: 'color' },
            { label: 'Black & grey', value: 'black-and-grey' },
          ],
          defaultValue: ['color', 'black-and-grey'],
        }),
        placementIdeas: fields.text({ label: 'Placement ideas' }),
        repeatable: fields.checkbox({
          label: 'Repeatable',
          description: 'Off = one-off; once it is tattooed it is retired.',
          defaultValue: false,
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Available', value: 'available' },
            { label: 'Claimed', value: 'claimed' },
            { label: 'Tattooed', value: 'tattooed' },
          ],
          defaultValue: 'available',
        }),
        tattooedWork: fields.relationship({ label: 'Finished tattoo (in Works)', collection: 'works' }),
        instagramUrl: fields.url({ label: 'Instagram post' }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),

    products: collection({
      label: 'Shop',
      path: 'content/products/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['kind', 'priceCents', 'inventory', 'sold'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        kind: fields.select({
          label: 'Kind',
          options: [
            { label: 'Original (one of one)', value: 'original' },
            { label: 'Print', value: 'print' },
          ],
          defaultValue: 'print',
        }),
        images: fields.array(
          fields.object({
            image: image('products'),
            alt: fields.text({ label: 'Alt text', validation: { isRequired: true } }),
          }),
          { label: 'Images', itemLabel: (p) => p.fields.alt.value || 'Image', validation: { length: { min: 1 } } },
        ),
        priceCents: fields.integer({
          label: 'Price (cents, USD)',
          description: '12500 = $125.00. This is the only place a price lives.',
          validation: { min: 100 },
        }),
        inventory: fields.integer({
          label: 'Inventory',
          description: 'Originals are always 1. Prints: how many are left. The live count lives in Redis after the first sale; this is the starting value.',
          defaultValue: 1,
          validation: { min: 0 },
        }),
        sold: fields.checkbox({
          label: 'Sold out (manual override)',
          description: 'Turn on to mark sold by hand, e.g. after an in-person sale.',
          defaultValue: false,
        }),
        edition: fields.text({ label: 'Edition', description: 'e.g. Edition of 25, signed and numbered' }),
        size: fields.text({ label: 'Size' }),
        medium: fields.text({ label: 'Medium' }),
        year: fields.integer({ label: 'Year' }),
        framing: fields.select({
          label: 'Framing',
          options: [
            { label: 'Not offered', value: 'none' },
            { label: 'Optional add-on', value: 'optional' },
            { label: 'Included', value: 'included' },
          ],
          defaultValue: 'none',
        }),
        framingCents: fields.integer({ label: 'Framing add-on (cents)', defaultValue: 0 }),
        description: fields.text({ label: 'Description (in Thor\'s voice)', multiline: true }),
        work: fields.relationship({ label: 'Related piece in Works', collection: 'works' }),
        featured: fields.checkbox({ label: 'Feature in shop', defaultValue: false }),
        stripeProductId: fields.text({ label: 'Stripe product ID', description: 'Filled by `npm run sync:stripe`. Leave blank.' }),
        stripePriceId: fields.text({ label: 'Stripe price ID', description: 'Filled by `npm run sync:stripe`. Leave blank.' }),
      },
    }),

    appearances: collection({
      label: 'Appearances',
      path: 'content/appearances/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['date', 'kind', 'venue'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        kind: fields.select({
          label: 'Kind',
          options: [
            { label: 'Flash day', value: 'flash-day' },
            { label: 'Life drawing', value: 'life-drawing' },
            { label: 'Guest spot', value: 'guest-spot' },
            { label: 'Convention', value: 'convention' },
            { label: 'Fundraiser', value: 'fundraiser' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'flash-day',
        }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        endDate: fields.date({ label: 'End date (optional)' }),
        time: fields.text({ label: 'Time', description: 'e.g. 6–9 pm' }),
        venue: fields.text({ label: 'Venue', defaultValue: 'EngineerInk Tattoo & Body Piercing' }),
        city: fields.text({ label: 'City', defaultValue: 'Fullerton, CA' }),
        flyer: fields.image({ label: 'Flyer', directory: 'public/media/events', publicPath: '/media/events/' }),
        flyerAlt: fields.text({ label: 'Flyer alt text' }),
        link: fields.url({ label: 'Link (RSVP, event page)' }),
        note: fields.text({ label: 'Note', multiline: true }),
        hidden: fields.checkbox({ label: 'Hide', defaultValue: false }),
      },
    }),

    testimonials: collection({
      label: 'Client words',
      path: 'content/testimonials/*',
      slugField: 'name',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        handle: fields.text({ label: 'Handle', description: 'e.g. @someone' }),
        url: fields.url({ label: 'Link' }),
        quote: fields.text({ label: 'Quote', multiline: true, validation: { isRequired: true } }),
        visible: fields.checkbox({ label: 'Visible', defaultValue: true }),
      },
    }),

    socials: collection({
      label: 'Social links',
      path: 'content/socials/*',
      slugField: 'platform',
      format: { data: 'yaml' },
      columns: ['handle', 'visible'],
      schema: {
        platform: fields.slug({ name: { label: 'Platform', description: 'instagram, tiktok, facebook, youtube, email, other' } }),
        label: fields.text({ label: 'Label', description: 'e.g. Instagram · designs & flash' }),
        handle: fields.text({ label: 'Handle', description: 'e.g. @thelampkeyartery' }),
        url: fields.url({ label: 'URL' }),
        visible: fields.checkbox({ label: 'Visible', defaultValue: true }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),
  },

  singletons: {
    settings: singleton({
      label: 'Site settings',
      path: 'content/settings',
      format: { data: 'yaml' },
      schema: {
        artistName: fields.text({ label: 'Artist name', defaultValue: 'Thor Becker' }),
        brandName: fields.text({ label: 'Brand name', defaultValue: 'Lampkey Artery' }),
        statement: fields.text({ label: 'One-line statement', description: 'Home page, under the name.' }),
        studioName: fields.text({ label: 'Studio', defaultValue: 'EngineerInk Tattoo & Body Piercing' }),
        studioCity: fields.text({ label: 'Studio city', defaultValue: 'Fullerton, CA' }),
        region: fields.text({ label: 'Region (SEO)', defaultValue: 'Orange County' }),
        homeCity: fields.text({ label: 'Home city', defaultValue: 'Lake Elsinore, CA' }),
        email: fields.text({ label: 'Public email', defaultValue: 'lampkeyart@gmail.com' }),
        thanksLine: fields.text({ label: 'Sign-off', defaultValue: 'Thanks for looking.' }),
        thorPhoto: fields.image({ label: 'Photo of Thor (home page)', directory: 'public/media/thor', publicPath: '/media/thor/' }),
        thorPhotoAlt: fields.text({ label: 'Photo alt text' }),
        homeIntro: fields.text({ label: 'Home intro (in Thor\'s voice)', multiline: true }),
        depositAmount: fields.text({ label: 'Deposit amount (display)', description: 'e.g. $100. Shown in booking copy only; collected via Cal.com.' }),
        depositNote: fields.text({ label: 'Deposit note', multiline: true }),
        cancellationNote: fields.text({ label: 'Cancellation note', multiline: true }),
        shippingFlatCents: fields.integer({ label: 'Flat-rate shipping (cents)', defaultValue: 1500 }),
        shipsFrom: fields.text({ label: 'Ships from', defaultValue: 'Lake Elsinore, CA' }),
        shippingNote: fields.text({ label: 'Shipping note', multiline: true }),
        instagramMain: fields.text({ label: 'Main Instagram handle', defaultValue: 'thelampkeyartery' }),
        instagramDesigns: fields.text({ label: 'Designs Instagram handle', defaultValue: 'lampkey_tattoo_designs' }),
        inquiryIntro: fields.text({ label: 'Inquiry form intro', multiline: true }),
      },
    }),

    about: singleton({
      label: 'About',
      path: 'content/about',
      format: { data: 'yaml' },
      schema: {
        headline: fields.text({ label: 'Headline' }),
        story: fields.text({ label: 'Story (first person)', multiline: true }),
        background: fields.text({ label: 'Background', multiline: true, description: 'Years working, shop history, notable work.' }),
        community: fields.text({ label: 'Community', multiline: true, description: 'Inksomniac Life Drawing, flash days.' }),
        photos: fields.array(
          fields.object({
            image: fields.image({ label: 'Photo', directory: 'public/media/thor', publicPath: '/media/thor/' }),
            alt: fields.text({ label: 'Alt text' }),
            caption: fields.text({ label: 'Caption' }),
          }),
          { label: 'Studio and portrait photos', itemLabel: (p) => p.fields.alt.value || 'Photo' },
        ),
        shows: fields.array(fields.text({ label: 'Show' }), { label: 'Shows', itemLabel: (p) => p.value }),
        press: fields.array(
          fields.object({ title: fields.text({ label: 'Title' }), url: fields.url({ label: 'URL' }) }),
          { label: 'Press', itemLabel: (p) => p.fields.title.value },
        ),
      },
    }),

    booking: singleton({
      label: 'Booking copy',
      path: 'content/booking',
      format: { data: 'yaml' },
      schema: {
        intro: fields.text({ label: 'Intro', multiline: true }),
        paths: fields.array(
          fields.object({
            key: fields.select({
              label: 'Path',
              options: [
                { label: 'Tattoo', value: 'tattoo' },
                { label: 'Commission', value: 'commission' },
                { label: 'Live event', value: 'event' },
              ],
              defaultValue: 'tattoo',
            }),
            title: fields.text({ label: 'Title' }),
            offer: fields.text({ label: 'What he offers', multiline: true }),
            turnaround: fields.text({ label: 'Turnaround', multiline: true }),
            terms: fields.text({ label: 'Deposit & cancellation', multiline: true }),
            send: fields.text({ label: 'What to send', multiline: true }),
          }),
          { label: 'The three paths', itemLabel: (p) => p.fields.title.value },
        ),
        steps: fields.array(
          fields.object({ title: fields.text({ label: 'Step' }), body: fields.text({ label: 'Body', multiline: true }) }),
          { label: 'Working with Thor: tattoo, idea to healed', itemLabel: (p) => p.fields.title.value },
        ),
        eventSteps: fields.array(
          fields.object({ title: fields.text({ label: 'Step' }), body: fields.text({ label: 'Body', multiline: true }) }),
          { label: 'Working with Thor: live events', itemLabel: (p) => p.fields.title.value },
        ),
      },
    }),
  },
});
