import json

# Coordinates mapping (Title -> (Lat, Long))
# Note: Using a dictionary for O(1) lookup. Keys must match titles in json exactly or close enough.
coords_map = {
    "Debre Meheret Kedus Michael Ethiopian Orthodox Cathedral": (38.932824, -76.980644),
    "Re'ese Adbarat Debre Selam Kidist Mariam Ethiopian Orthodox Tewahedo Church": (38.948297, -77.026118),
    "Debre Haile Kedus Gabriel Ethiopian Orthodox Tewahedo Church": (38.932742, -76.969185),
    "Debre Hail Kedus Gabriel and Kedus Yohannes Ethiopian Orthodox Church": (38.956044, -77.029817),
    "Mekane Hiwet Medhane Alem Orthodox Tewahdo Church": (38.937222, -76.967814),
    "St. Urael W. Rufael Ethiopian Orthodox Tewahedo Church": (38.966774, -77.016335),
    "Mekane Selam St. Urael EOTC": (38.959954, -77.037411),
    "Saint Nicholas Orthodox Cathedral": (38.931885, -77.070987),
    "Ebenezer Eritrean Church": (38.959546, -77.026852),
    "International Ethiopian Evangelical Church": (38.986374, -77.019747),
    "St George Antiochian Orthodox Church": (38.957597, -77.038575),
    "Ethiopian Community Center": (38.981881, -77.022416),
    "Eritrean Evangelical Church": (38.957864, -77.037996),
    "Ss. Joachim and Anna Orthodox Mission": (45.817348, -120.385563),
    "Anketse Birhan Saint Mary and Saint Arsema Ethiopian Orthodox Tewahedo Church": (47.818833, -122.285854),
    "የሲያትል ደብረ ቁስቋም ቅድስት ማርያም ወደብረ ቀራንዮመድኃኔ ዓለም ቤተክርስቲያን": (47.483133, -122.213238),
    "Saint Gebriel Ethiopian Orthodox Tewahido Church Seattle": (47.595914, -122.301323),
    "Debre Bisrat St. Gabriel in Lynnwood St. George Ethiopian Orthodox Church St. Gabriel Church ቅዱስ ገብርኤል ቤተክርስትያን": (47.822769, -122.316839),
    "Debre Amin Abune Teklehaimanot Orthodox Church": (47.502011, -122.368739),
    "Kibre Qidusan Medhanealem Ethiopian Orthodox Tewahedo Church": (47.525546, -122.302359),
    "ደብረ ገሊላ ቅዱስ በዓለ ወልድ ወሩፋኤል ቤተ ክርስቲያን ሲያትል ዋሺንግተን Debre Gelila kidus Beale weld & Rufael church Seattle WA": (47.465137, -122.280175),
    "St Michael Ethiopian Orthodox Tewahedo Church": (47.801646, -122.345851),
    "Emmanuel Tigrean Orthodox Tewahedo Church": (47.600109, -122.321153),
    "Debre Tibeb Beata Lemariam Ethiopian Orthodox Tewahedo Church": (47.765624, -122.235952),
    "Medhane Alem Eritrean Orthodox Tewahedo Church Seattle WA": (47.501569, -122.221564),
    "Hamere Noah Kidist Kidane Mihret and Kidus Urael Ethiopian Orthodox Tewahido Church": (47.420803, -122.304543),
    "Eritrean Kidisti Selassie": (47.712613, -122.317511),
    "Saint Mary Ethiopian Orthodox Tewahdo Church": (47.697018, -117.433842),
    "Kidane Mihret Eritrean Orthodox Tewhado church in Seattle": (47.511397, -122.364421),
    "Saint Michael Ethiopian Orthodox Tewahedo Church": (47.509726, -122.227485),
    "Bethel Ethiopian Church of Seattle": (47.719602, -122.296155),
    "Prophet Elijah Antiochian": (46.995964, -120.548766),
    "Three Hierarchs Orthodox Church": (47.447551, -120.320491),
    "St. George Ethiopian Orthodox Tewahedo Church": (37.794689, -122.420603),
    "Ethiopian Orthodox Tewahedo ​Mekane Selam Medhane Alem Cathedral": (37.807856, -122.193215),
    "Debre Meheret Kidus Michael Ethiopian Orthodox Tewahedo Church": (37.820258, -122.262591),
    "Mekane Rama Saint Gabriel Cathedral Ethiopian Orthodox Tewahedo Church": (37.288277, -121.847113),
    "Debre Selam Iyesus Ethiopian Orthodox Tewahedo Church Oakland California": (37.784411, -122.223595),
    "St. Mary Ethiopian Orthodox Tewahedo Church": (37.337494, -121.884142),
    "Debre Selam St. Michael and St. Mary Ethiopian Orthodox Tewahido church": (38.544673, -121.439446),
    "Fenote Loza Saint Teklehaymanot Ethiopian Orthodox Tewahedo Church Sacramento": (38.541461, -121.411649),
    "Gateway to Heaven Saint John the Baptist & St. Arsema Ethiopian Orthodox Tewahedo Monastery": (35.839843, -120.738872),
    "Mekane Sebhat Kidist Selasei Ethiopian Orthodox Tewahedo Church Sacramento": (38.502055, -121.425892),
    "Kidist Selasie Ethiopian Orthodox Tewahedo Church Los Angeles": (33.945281, -118.349635),
    "St Mary's Ethiopian Orthodox Tewahedo Church": (33.988081, -118.381488),
    "Virgin Mary Ethiopian Orthodox Tewahedo Cathedral": (33.999557, -118.271389),
    "Beza Bezuhan Kidanemihret Ethiopian Orthodox Church Los Angeles": (34.029671, -118.257322),
    "Debre Sahel St Michael Ethiopian Orthodox Tewahedo Church in Orange County": (33.946979, -118.069416),
    "Hamere Nohe Kidane Mihret WeKidus Yohannes Metimq Ethiopian Orthodox Tewahedo Church": (33.967814, -118.354145),
    "St. Urael Ethiopian Orthodox Tewahedo Church": (34.008459, -118.303975),
    "Ethiopian Orthodox Tewahido Church, San Diego": (32.748184, -117.086435),
    "St. Gabriel Ethiopian Orthodox Tewahido Church of San Diego": (32.622619, -117.080514),
    "Fresno Debre Selam MedhaneAlem Ethiopian Orthodox Tewahido Church": (36.744155, -119.743128),
    "DebreMihret St. Michael’s Ethiopian Orthodox Church": (36.082711, -115.201535),
    "Debre Bisrat St. Gabriel Ethiopian Orthodox Tewahedo Church": (36.035985, -115.275816),
    "St Michaels Ethiopian Orthodox": (36.008064, -115.176467)
}

try:
    with open("backend/churches.json", "r") as f:
        churches = json.load(f)
    
    updated_churches = []
    for church in churches:
        title = church.get("title")
        if title in coords_map:
            lat, long = coords_map[title]
            church["location"] = {
                "type": "Point",
                "coordinates": [long, lat] # GeoJSON is [long, lat]
            }
            # Ensure state is present and formatted correctly if needed
            # The file already has "state": "District of Columbia", etc.
            # We might want to normalize state names if they are inconsistent, but they look okay.
        else:
            print(f"Warning: No coordinates found for {title}")
        
        updated_churches.append(church)
    
    with open("backend/churches.json", "w") as f:
        json.dump(updated_churches, f, indent=2)
        
    print("Successfully updated churches.json with coordinates.")

except Exception as e:
    print(f"Error: {e}")
