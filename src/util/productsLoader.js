import pic1 from '../assets/ATS Mehanizam slika 1.webp';
import pic2 from '../assets/ATS Mehanizam slika 2.webp';
import pic3 from '../assets/Brzovez.webp';
import pic4 from '../assets/Lajsna za kalendare do 1m duzine.webp';
import pic5 from '../assets/Metalni zavrseci sa gumicom.webp';
import pic6 from '../assets/Opruzni lim.webp';
import pic7 from '../assets/Otvarac 1.webp';
import pic8 from '../assets/Otvarac 2.webp';
import pic9 from '../assets/Setajuca mehanika.webp';
import pic10 from '../assets/Standardna iglica.webp';
import pic11 from '../assets/Ugao za 25.webp';
import pic12 from '../assets/Ugao za 32.webp';
import pic13 from '../assets/Zakacka za klik klak ramove.webp';

// Loader for products
export const productsLoader = async () => {
  const products = [
      { name: "ATŠ mehanizam slika 1", src: pic1},
      { name: "ATŠ mehanizam slika 2", src: pic2 },
      { name: "Brzovez", src: pic3 },
      { name: "Lajsna za kalendare do 1m dužine", src: pic4 },
      { name: "Metalni završeci sa gumicom", src: pic5 },
      { name: "Opružni lim", src: pic6 },
      { name: "Otvarač", src: pic7 },
      { name: "Otvarač sa stikerom (na slici bez)", src: pic8},
      { name: "Šetajuća mehanika", src: pic9 },
      { name: "Standardna iglica", src: pic10},
      { name: "Ugao za 25", src: pic11 },
      { name: "Ugao za 32", src: pic12 },
      { name: "Zakačka za klik klak ramove", src: pic13 },
  ];

  return { products };
}