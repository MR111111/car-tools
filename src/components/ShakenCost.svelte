<script lang="ts">
  type CarClass = 'normal' | 'kei';
  type InspectionPlace = 'dealer' | 'garage' | 'specialist' | 'user';

  let carClass = $state<CarClass>('normal');
  let weightKg = $state(1500);
  let yearsOld = $state(3);
  let isEco = $state(false);
  let place = $state<InspectionPlace>('garage');

  // 自賠責保険料（24ヶ月）
  const jibaiseki = $derived(carClass === 'kei' ? 17540 : 17650);

  // 印紙代
  const inshidai = $derived(carClass === 'kei' ? 1100 : 1800);

  // 自動車重量税テーブル（2年分）
  function getWeightTax(kg: number, eco: boolean, old: number, kei: boolean): number {
    if (kei) {
      if (old >= 18) return 8800;
      if (old >= 13) return 8200;
      return eco ? 5000 : 6600;
    }
    const table: [number, number, number, number, number][] = [
      [500, 8200, 5000, 11400, 12600],
      [1000, 16400, 10000, 22800, 25200],
      [1500, 24600, 15000, 34200, 37800],
      [2000, 32800, 20000, 45600, 50400],
      [2500, 41000, 25000, 57000, 63000],
      [3000, 49200, 30000, 68400, 75600],
    ];
    const row = table.find(([w]) => kg <= w) ?? table[table.length - 1];
    if (old >= 18) return row[4];
    if (old >= 13) return row[3];
    return eco ? row[2] : row[1];
  }

  const weightTax = $derived(getWeightTax(weightKg, isEco, yearsOld, carClass === 'kei'));
  const legalTotal = $derived(jibaiseki + inshidai + weightTax);

  // 整備費用の目安（min/max）
  const maintenanceRanges: Record<InspectionPlace, Record<CarClass, [number, number]>> = {
    dealer: { normal: [40000, 100000], kei: [30000, 70000] },
    garage: { normal: [25000, 60000], kei: [20000, 50000] },
    specialist: { normal: [15000, 40000], kei: [10000, 30000] },
    user: { normal: [0, 0], kei: [0, 0] },
  };

  const maintenanceRange = $derived(maintenanceRanges[place][carClass]);
  const totalMin = $derived(legalTotal + maintenanceRange[0]);
  const totalMax = $derived(legalTotal + maintenanceRange[1]);
  const monthlyAvg = $derived(Math.round((totalMin + totalMax) / 2 / 24));

  const placeLabels: Record<InspectionPlace, string> = {
    dealer: 'ディーラー',
    garage: '整備工場',
    specialist: '車検専門店',
    user: 'ユーザー車検',
  };

  function fmt(n: number) {
    return n.toLocaleString('ja-JP');
  }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-2">車種区分</label>
      <div class="flex gap-4">
        {#each [['normal','普通車'],['kei','軽自動車']] as [val, label]}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" bind:group={carClass} value={val} class="accent-sky-500" />
            <span class="text-slate-300">{label}</span>
          </label>
        {/each}
      </div>
    </div>

    {#if carClass === 'normal'}
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        車両重量：<span class="text-sky-400 font-bold">{weightKg.toLocaleString()} kg</span>
      </label>
      <input type="range" min="500" max="3000" step="500" bind:value={weightKg} class="w-full accent-sky-500" />
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>500kg</span><span>3,000kg</span>
      </div>
    </div>
    {/if}

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        新車登録からの経過年数：<span class="text-sky-400 font-bold">{yearsOld}年</span>
      </label>
      <input type="range" min="1" max="25" step="1" bind:value={yearsOld} class="w-full accent-sky-500" />
    </div>

    <div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" bind:checked={isEco} class="w-5 h-5 accent-sky-500" />
        <span class="text-slate-300">エコカー減税対象（重量税50%減）</span>
      </label>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-2">車検を受ける場所</label>
      <div class="grid grid-cols-2 gap-2">
        {#each Object.entries(placeLabels) as [val, label]}
          <label class="flex items-center gap-2 cursor-pointer bg-slate-700 px-3 py-2 rounded-lg border border-slate-600 hover:border-sky-500 transition-colors {place === val ? 'border-sky-500 bg-sky-950' : ''}">
            <input type="radio" bind:group={place} value={val} class="accent-sky-500" />
            <span class="text-slate-300 text-sm">{label}</span>
          </label>
        {/each}
      </div>
    </div>
  </div>

  <!-- Results -->
  <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <h3 class="text-lg font-bold text-white mb-4">費用の内訳</h3>

    {#if yearsOld >= 18}
      <div class="bg-red-950 border border-red-700 rounded-lg p-3 mb-4 text-sm text-red-300">
        ⚠️ 18年超のため自動車重量税が重課されています。
      </div>
    {:else if yearsOld >= 13}
      <div class="bg-yellow-950 border border-yellow-700 rounded-lg p-3 mb-4 text-sm text-yellow-300">
        ⚠️ 13年超のため自動車重量税が重課されています。
      </div>
    {/if}

    <div class="space-y-3 mb-6">
      <div class="flex justify-between items-center py-2 border-b border-slate-700">
        <span class="text-slate-300 text-sm">自賠責保険料（24ヶ月）</span>
        <span class="text-white font-medium">{fmt(jibaiseki)} 円</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-slate-700">
        <span class="text-slate-300 text-sm">自動車重量税（2年分）</span>
        <span class="text-white font-medium">{fmt(weightTax)} 円</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-slate-700">
        <span class="text-slate-300 text-sm">印紙代</span>
        <span class="text-white font-medium">{fmt(inshidai)} 円</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-slate-700">
        <span class="text-slate-300 text-sm font-medium">法定費用 合計</span>
        <span class="text-sky-400 font-bold">{fmt(legalTotal)} 円</span>
      </div>
      <div class="flex justify-between items-center py-2">
        <span class="text-slate-300 text-sm">整備費用の目安（{placeLabels[place]}）</span>
        <span class="text-white font-medium">
          {place === 'user' ? '0円（自分で整備）' : `${fmt(maintenanceRange[0])}〜${fmt(maintenanceRange[1])} 円`}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-sky-900 border border-sky-500 rounded-lg p-4 text-center">
        <p class="text-slate-300 text-xs mb-1">合計費用の目安</p>
        <p class="text-sky-300 font-bold text-2xl">
          {place === 'user' ? fmt(legalTotal) : `${fmt(totalMin)}〜${fmt(totalMax)}`}
        </p>
        <p class="text-slate-400 text-xs mt-1">円</p>
      </div>
      <div class="bg-slate-700 rounded-lg p-4 text-center">
        <p class="text-slate-400 text-xs mb-1">次回車検までの月額換算</p>
        <p class="text-sky-400 font-bold text-2xl">
          {place === 'user' ? fmt(Math.round(legalTotal / 24)) : fmt(monthlyAvg)}
        </p>
        <p class="text-slate-500 text-xs mt-1">円/月（目安平均）</p>
      </div>
    </div>
  </div>

  <p class="text-xs text-slate-500">※ 整備費用は目安であり、実際の費用は車両の状態・店舗により大きく異なります。事前に複数店舗で見積もりを取ることをおすすめします。</p>
</div>
