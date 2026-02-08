import { createContext, useContext, useState, useEffect } from 'react';
import { cardsAPI } from '../services/api';

const CardsContext = createContext();

export const useCards = () => useContext(CardsContext);

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  const [trashedCards, setTrashedCards] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load cards from API when component mounts
  useEffect(() => {
    const loadCards = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const remoteCards = await cardsAPI.getAll();
        setCards(remoteCards);
        
        // Also load localStorage for trashedCards/favorites (API doesn't store these yet)
        const storedTrashed = localStorage.getItem('trashedCards');
        const storedFavorites = localStorage.getItem('favoritedCards');
        const storedRecent = localStorage.getItem('recentCards');
        if (storedTrashed) setTrashedCards(JSON.parse(storedTrashed));
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        if (storedRecent) setRecentItems(JSON.parse(storedRecent));
      } catch (error) {
        console.error('Failed to load cards:', error);
        // Fallback to localStorage
        const storedCards = localStorage.getItem('medicalCards');
        if (storedCards) setCards(JSON.parse(storedCards));
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  // Sync to localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('medicalCards', JSON.stringify(cards));
    }
  }, [cards, loading]);

  useEffect(() => {
    localStorage.setItem('trashedCards', JSON.stringify(trashedCards));
  }, [trashedCards]);

  useEffect(() => {
    localStorage.setItem('favoritedCards', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('recentCards', JSON.stringify(recentItems));
  }, [recentItems]);

  const addCard = async (card) => {
    try {
      setSyncing(true);
      const savedCard = await cardsAPI.create(card);
      setCards(prev => [savedCard, ...prev]);
      return savedCard;
    } catch (error) {
      console.error('Failed to add card:', error);
      // Fallback: add locally only
      const newCard = {
        ...card,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCards(prev => [newCard, ...prev]);
      return newCard;
    } finally {
      setSyncing(false);
    }
  };

  const updateCard = async (id, updates) => {
    try {
      setSyncing(true);
      const updatedCard = await cardsAPI.update(id, updates);
      setCards(prev => prev.map(c => c.id === id ? updatedCard : c));
      return updatedCard;
    } catch (error) {
      console.error('Failed to update card:', error);
      // Fallback: update locally only
      setCards(prev => prev.map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ));
      return { ...updates, id };
    } finally {
      setSyncing(false);
    }
  };

  const deleteCard = async (id) => {
    try {
      setSyncing(true);
      await cardsAPI.delete(id);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete card:', error);
      // Fallback: delete locally only
      setCards(prev => prev.filter(c => c.id !== id));
    } finally {
      setSyncing(false);
    }
  };

  const trashCard = (id) => {
    // Soft delete - move to trash
    setCards(prev => prev.filter(card => card.id !== id));
    const cardToTrash = cards.find(card => card.id === id);
    if (cardToTrash) {
      setTrashedCards(prev => [{ ...cardToTrash, trashedAt: new Date().toISOString() }, ...prev]);
    }
    setFavorites(prev => prev.filter(fav => fav !== id));
  };

  const restoreCard = (id) => {
    const trashedCard = trashedCards.find(card => card.id === id);
    if (trashedCard) {
      const { trashedAt, ...cardData } = trashedCard;
      setCards(prev => [cardData, ...prev]);
      setTrashedCards(prev => prev.filter(card => card.id !== id));
    }
  };

  const permanentlyDeleteCard = (id) => {
    setTrashedCards(prev => prev.filter(card => card.id !== id));
    setFavorites(prev => prev.filter(fav => fav !== id));
  };

  const emptyTrash = () => {
    setTrashedCards([]);
  };

  const toggleFavorite = (cardId) => {
    setFavorites(prev => 
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [cardId, ...prev]
    );
  };

  const isFavorite = (cardId) => favorites.includes(cardId);

  const trackRecent = (cardId) => {
    setRecentItems(prev => {
      const filtered = prev.filter(id => id !== cardId);
      return [cardId, ...filtered].slice(0, 10);
    });
  };

  const getCardsBySection = (specialty, section) => {
    return cards.filter(card => 
      card.specialty === specialty && card.section === section
    );
  };

  const searchCards = (query) => {
    if (!query.trim()) return cards;
    const q = query.toLowerCase();
    return cards.filter(card => 
      card.title?.fr?.toLowerCase().includes(q) ||
      card.content?.fr?.toLowerCase().includes(q) ||
      card.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  };

  const getFavoriteCards = () => {
    return cards.filter(card => favorites.includes(card.id));
  };

  const getRecentCards = () => {
    return recentItems
      .map(id => cards.find(card => card.id === id))
      .filter(Boolean)
      .slice(0, 5);
  };

  return (
    <CardsContext.Provider value={{
      cards,
      trashedCards,
      favorites,
      recentItems,
      loading,
      syncing,
      addCard,
      updateCard,
      deleteCard,
      trashCard,
      restoreCard,
      permanentlyDeleteCard,
      emptyTrash,
      toggleFavorite,
      isFavorite,
      trackRecent,
      getCardsBySection,
      searchCards,
      getFavoriteCards,
      getRecentCards
    }}>
      {children}
    </CardsContext.Provider>
  );
};
