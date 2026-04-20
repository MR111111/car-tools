<script lang="ts">
  type CarClass = 'normal' | 'kei';
  type InspectionPlace = 'dealer' | 'garage' | 'specialist' | 'user';

  let carClass = $state<CarClass>('normal');
  let weightKg = $state(1500);
  let yearsOld = $state(3);
  let isEco = $state(false);
  let place = $state<InspectionPlace>('garage');

  const jibaiseki = $derived(carClass === 'kei' ? 17540 : 17650);
  const inshidai = $derived(carClass === 'kei' ? 1100 : 1800);

  function getWeightTax(kg: number, eco: boolean, old: number, kei: boolean): number {
    if (kei) return old >= 18 ? 8800 : old >= 13 ? 8200 : eco ? 5000 : 6600;
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
    dealer: 'ディーラー', garage: '整備工場', specialist: '車検専門店', user: 'ユーザー車検',
  };

  function fmt(n: number) { return n.toLocaleString('ja-JP'); }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">車種区分</label>
      <div class="flex gap-4">
        {#each [['normal','普通車'],['kei','軽自動車']] as [val, label]}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" bind:group={carClass} value={val} class="accent-sky-500" />
            <span class="text-gray-700">{label}</span>
          </label>
        {/each}
      </div>
    </div>

    {#if carClass === 'normal'}
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        車両重量：<span class="text-sky-600 font-bold">{weightKg.toLocaleString()} kg</span>
      </label>
      <input type="range" min="500" max="3000" step="500" bind:value={weightKg} class="w-full accent-sky-500" />
    </div>
    {/if}

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        新車登録からの経過年数：<span class="text-sky-600 font-bold">{yearsOld}年</span>
      </label>
      <input type="range" min="1" max="25" step="1" bind:value={yearsOld} class="w-full accent-sky-500" />
    </div>

    <div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" bind:checked={isEco} class="w-5 h-5 accent-sky-500" />
        <span class="text-gray-700">エコカー減税対象（重量税50%減）</span>
      </label>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">車検を受ける場所</label>
      <div class="grid grid-cols-2 gap-2">
        {#each Object.entries(placeLabels) as [val, label]}
          <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-colors {place === val ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-700 hover:border-sky-300'}">
            <input type="radio" bind:group={place} value={val} class="accent-sky-500" />
            <span class="text-sm">{label}</span>
          </label>
        {/each}
      </div>
    </div>
  </div>

  <!-- Results -->
  <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-bold text-gray-900 mb-4">費用の内訳</h3>

    {#if yearsOld >= 18}
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">⚠️ 18年超のため自動車重量税が重課されています。</div>
    {:else if yearsOld >= 13}
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-700">⚠️ 13年超のため自動車重量税が重課されています。</div>
    {/if}

    <div class="space-y-2 mb-6">
      {#each [['自賠責保険料（24ヶ月）', jibaiseki], ['自動車重量税（2年分）', weightTax], ['印紙代', inshidai]] as [label, val]}
        <div class="flex justify-between items-center py-2 border-b border-gray-200">
          <span class="text-gray-600 text-sm">{label}</span>
          <span class="text-gray-900 font-medium">{fmt(val as number)} 円</span>
        </div>
      {/each}
      <div class="flex justify-between items-center py-2 border-b border-gray-200">
        <span class="text-gray-700 text-sm font-medium">法定費用 合計</span>
        <span class="text-sky-600 font-bold">{fmt(legalTotal)} 円</span>
      </div>
      <div class="flex justify-between items-center py-2">
        <span class="text-gray-600 text-sm">整備費用の目安（{placeLabels[place]}）</span>
        <span class="text-gray-900 font-medium">
          {place === 'user' ? '0円（自分で整備）' : `${fmt(maintenanceRange[0])}〜${fmt(maintenanceRange[1])} 円`}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-sky-600 rounded-lg p-4 text-center">
        <p class="text-sky-100 text-xs mb-1">合計費用の目安</p>
        <p class="text-white font-bold text-xl">
          {place === 'user' ? `${fmt(legalTotal)}円` : `${fmt(totalMin)}〜${fmt(totalMax)}円`}
        </p>
      </div>
      <div class="bg-white rounded-lg p-4 text-center border border-gray-200">
        <p class="text-gray-500 text-xs mb-1">次回車検までの月額換算</p>
        <p class="text-sky-600 font-bold text-xl">
          {place === 'user' ? fmt(Math.round(legalTotal / 24)) : fmt(monthlyAvg)} 円/月
        </p>
      </div>
    </div>
  </div>
  <p class="text-xs text-gray-400">※ 整備費用は目安です。実際の費用は車両の状態・店舗により大きく異なります。</p>
</div>
