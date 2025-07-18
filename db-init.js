const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('astronomy.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    name TEXT,
    description TEXT,
    imagePath TEXT,
    lightcurve TEXT,
    taxonomy TEXT
  )`);

    // 3. Insert example data
  const stmt = db.prepare(`
    INSERT INTO objects (slug, name, description, imagePath, lightcurve, taxonomy)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const objects = [
    {
      slug: 'gault',
      name: '6478 Gault',
      description: 'A rare example of a main-belt asteroid with a visible tail.',
      imagePath: 'gault/gault.jpeg',
      lightcurve: 'gault/lightcurve.png',
      taxonomy: 'gault/taxonomy.jpg'
    },
    {
      slug: 'psyche',
      name: '16 psyche',
      description: 'A giant metal-rich asteroid with a spacecraft mission.',
      imagePath: 'psyche/psyche.png',
      lightcurve: 'psyche/lightcurve.png',
      taxonomy: 'psyche/taxonomy.png'
    },
    {
      slug: '3I',
      name: '3I/ATLAS',
      description: 'The 3rd interstellar object discovered, and first interstellar comet.',
      imagePath: '3I/3I.png',
      lightcurve: '3I/lightcurve.png',
      taxonomy: '3I/taxonomy.png'
    }
  ];

  objects.forEach(obj => {
    stmt.run(obj.slug, obj.name, obj.description, obj.imagePath, obj.lightcurve, obj.taxonomy);
  });

  stmt.finalize();
});

db.close(() => {
  console.log('Database seeded!');
});