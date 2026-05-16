export const projectContact = {
  telegramUrl: "https://t.me/Roman_cryptopro",
  telegramLabel: "@Roman_cryptopro",
  presentationUrl: "/presentations/fintech-os-investor-deck.pdf",
  presentationPdfUrl: "/presentations/fintech-os-investor-deck.pdf",
  presentationPptxUrl: "/presentations/fintech-os-investor-deck.pptx",
  presentationFileName: "fintech-os-investor-deck.pdf",
  presentationSourceFileName: "fintech-os-investor-deck.pptx",
  presentationSlides: Array.from({ length: 10 }, (_, index) => {
    const slideNumber = String(index + 1).padStart(2, "0");

    return {
      number: index + 1,
      title: `Слайд ${index + 1}`,
      imageUrl: `/presentations/deck-preview/slide-${slideNumber}.png`
    };
  })
};
