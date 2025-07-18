const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./astronomy.db'); // adjust path if needed

const PORT = 3000;

// ✅ Serve homepage with injected object list
app.get('/', (req, res) => {
  db.all('SELECT name, slug FROM objects ORDER BY name', (err, objects) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error.');
    }

      const listHtml = objects.map(obj =>
        `<li>${obj.name}</li>`
      ).join('');

    fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, html) => {
      if (err) {
        console.error('HTML read error:', err);
        return res.status(500).send('Error loading homepage.');
      }

      // Inject list into placeholder
      const finalHtml = html.replace('<!-- OBJECT_LIST -->', `<ul>${listHtml}</ul>`);
      res.send(finalHtml);
    });
  });
});

// Serve static files (your existing HTML site)
app.use(express.static('public'));

// Route to list all objects
app.get('/objects', (req, res) => {
  db.all("SELECT slug, name FROM objects", (err, rows) => {
    if (err) return res.status(500).send("Database error.");

    let html = '<h1>Astronomy Objects</h1><ul>';
    rows.forEach(obj => {
      html += `<li><a href="/object/${obj.slug}">${obj.name}</a></li>`;
    });
    html += '</ul><a href="/">Back to Home</a>';
    res.send(html);
  });
});

// Route for individual object page
app.get('/object/:slug', (req, res) => {
  const slug = req.params.slug;

  db.get('SELECT * FROM objects WHERE slug = ?', [slug], (err, object) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal server error');
    }

    if (!object) {
      return res.status(404).send(`<h1>Object not found</h1><p>No object with slug "${slug}"</p>`);
    }

    // Safe to use 'object' here
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${object.name}</title>
        <link rel="stylesheet" href="/CSS/main.css" />
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
          }

          nav {
            background-color: #222;
            padding: 1rem;
            color: white;
          }

          nav a {
            color: #ccc;
            text-decoration: none;
          }

          .container {
            max-width: 800px;
            margin: 2rem auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          h1 {
            margin-top: 0;
            font-size: 2rem;
            color: #222;
          }

          .object-image {
            width: 100%;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 1rem;
          }

          .description {
            font-size: 1.1rem;
            line-height: 1.6;
          }

          .meta {
            margin-top: 1rem;
            font-size: 0.9rem;
            color: #666;
          }
        </style>
      </head>
      <body>
        <nav><a href="/">← Back to Home</a></nav>
        <div class="container">
          <h1>${object.name}</h1>
          <img class="object-image" src="/images/${object.imagePath}" alt="${object.name}" />
          <p class="description">${object.description || "No description available."}</p>
          <h2> Light Curve </h2>
          <img class="object-image" src="/images/${object.lightcurve}" alt="Lightcurve" />
          <h2> Taxonomy </h2>
          <img class="object-image" src="/images/${object.taxonomy}" alt="Taxonomy" />
          <div class="meta">
            ${object.type ? `<strong>Type:</strong> ${object.type}<br>` : ""}
            ${object.constellation ? `<strong>Constellation:</strong> ${object.constellation}<br>` : ""}
            ${object.distance ? `<strong>Distance:</strong> ${object.distance} light-years<br>` : ""}
          </div>
        </div>
      </body>
      </html>
    `);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


app.get('/api/search', (req, res) => {
  const q = req.query.q || '';
  const query = `%${q.toLowerCase()}%`;

  db.all(
    `SELECT name, slug FROM objects
     WHERE LOWER(name) LIKE ? OR LOWER(slug) LIKE ?
     LIMIT 10`,
    [query, query],
    (err, rows) => {
      if (err) {
        console.error('Search error:', err);
        return res.status(500).json({ error: 'Search failed' });
      }

      res.json(rows);
    }
  );
});