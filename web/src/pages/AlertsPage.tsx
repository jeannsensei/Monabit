import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '@/hooks/useAlerts';
import { useSearchCoins, useCoinDetail } from '@/hooks/useCrypto';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectItem } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Search, Trash2, Bell, Info, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PriceAlert } from '@/types';

export function AlertsPage() {
  const { t } = useTranslation();
  const { alerts, isLoading, create, update, remove } = useAlerts();
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<{ id: string; symbol: string; name: string } | null>(null);
  const [deletingAlert, setDeletingAlert] = useState<{ id: string; symbol: string; target: number } | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const { data: searchResults } = useSearchCoins(search);
  const { data: coinDetail } = useCoinDetail(selectedCoin?.id ?? null);

  const resetForm = () => {
    setEditingAlert(null);
    setSelectedCoin(null);
    setSearch('');
    setTargetPrice('');
    setDirection('above');
    setShowForm(false);
  };

  const openCreate = () => {
    setEditingAlert(null);
    setSelectedCoin(null);
    setSearch('');
    setTargetPrice('');
    setDirection('above');
    setShowForm(true);
  };

  const openEdit = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setSelectedCoin({ id: alert.coin_id, symbol: alert.coin_symbol, name: alert.coin_symbol.toUpperCase() });
    setSearch('');
    setTargetPrice(alert.target_price.toLocaleString());
    setDirection(alert.direction);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!selectedCoin || !targetPrice) return;
    const payload = {
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      target_price: parseFloat(targetPrice.replace(/,/g, '')),
      direction,
    };
    if (editingAlert) {
      update({ id: editingAlert.id, target_price: payload.target_price, direction: payload.direction });
    } else {
      create(payload);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('alerts.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('alerts.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Bell size={16} />
          {t('alerts.newAlert')}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <Bell className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{t('alerts.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium uppercase">{alert.coin_symbol}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${alert.direction === 'above' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {alert.direction === 'above' ? '↑ Above' : '↓ Below'}
                  </span>
                  <span className="text-sm text-muted-foreground">${alert.target_price.toLocaleString()}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Created {new Date(alert.created_at).toLocaleDateString()}
                  {alert.is_triggered && ' — Triggered'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(alert)} className="rounded-md p-2 text-muted-foreground hover:bg-accent">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeletingAlert({ id: alert.id, symbol: alert.coin_symbol, target: alert.target_price })} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal open onClose={resetForm}>
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">{editingAlert ? 'Edit Alert' : t('alerts.newAlert')}</h2>
            <div className="mt-2 flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p>{editingAlert ? 'Modifying this alert will reset its triggered state.' : t('alerts.instructions')}</p>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">{t('alerts.searchCoin')}</label>
                <div className="relative mt-1">
                  {selectedCoin ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-md border bg-primary/10 px-3 py-2 text-sm">
                        <span className="font-medium">{selectedCoin.name}</span>
                        <span className="uppercase text-xs text-muted-foreground">{selectedCoin.symbol}</span>
                        {coinDetail && (
                          <span className="ml-auto font-mono text-xs text-muted-foreground">Current: {formatCurrency(coinDetail.current_price)}</span>
                        )}
                        {!editingAlert && (
                          <button onClick={() => { setSelectedCoin(null); setSearch(''); }} className="text-muted-foreground hover:text-foreground text-lg leading-none ml-1">×</button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('alerts.searchPlaceholder')} className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  )}
                  {search.length >= 2 && searchResults?.coins && !selectedCoin && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border bg-card shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.coins.slice(0, 8).map((c) => (
                        <button key={c.id} onClick={() => { setSelectedCoin(c); setSearch(''); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                          <img src={c.thumb} alt={c.name} className="h-5 w-5 rounded-full" />
                          <span className="font-medium">{c.name}</span>
                          <span className="uppercase text-muted-foreground">{c.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">{t('alerts.targetPrice')}</label>
                <input type="text" inputMode="decimal" value={targetPrice} onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = raw.split('.');
                  const formatted = parts[0] ? Number(parts[0]).toLocaleString() : '';
                  setTargetPrice(parts.length > 1 ? `${formatted}.${parts.slice(1).join('')}` : formatted);
                }} placeholder="0.00" className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
              </div>

              <div>
                <label className="block text-sm font-medium">{t('alerts.direction')}</label>
                <div className="mt-1">
                  <Select value={direction} onValueChange={(v) => setDirection(v as 'above' | 'below')}>
                    <SelectItem value="above">↑ {t('alerts.above')}</SelectItem>
                    <SelectItem value="below">↓ {t('alerts.below')}</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={resetForm} className="rounded-md border px-4 py-2 text-sm">{t('admin.cancel')}</button>
                <button onClick={handleSave} disabled={!selectedCoin || !targetPrice} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {editingAlert ? 'Update Alert' : t('alerts.createAlert')}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {deletingAlert && (
        <ConfirmDialog
          open
          title="Delete Alert"
          message={`Delete ${deletingAlert.symbol.toUpperCase()} price alert at $${deletingAlert.target.toLocaleString()}?`}
          confirmLabel="Delete"
          onConfirm={() => { remove(deletingAlert.id); setDeletingAlert(null); }}
          onCancel={() => setDeletingAlert(null)}
        />
      )}
    </div>
  );
}
