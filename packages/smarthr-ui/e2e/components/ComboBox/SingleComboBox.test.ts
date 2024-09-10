import { Selector } from 'testcafe'

fixture('SingleComboBox')
  .page(
    'http://localhost:6006/iframe.html?args=&id=forms（フォーム）-singlecombobox--single-combobox&viewMode=story',
  )
  .beforeEach(async (t) => {
    await t.maximizeWindow()
  })

function elementWithId(id: string | null | undefined) {
  const actualId = !id ? '' : `#${id.replace(/:/g, '\\:')}`
  return Selector(actualId)
}

test('アイテムの選択と選択解除ができること', async (t) => {
  const combobox = Selector('[data-test=single-combobox-default]')
  const listbox = elementWithId(await combobox.getAttribute('aria-controls'))
  const clearButton = combobox.sibling().find('.smarthr-ui-SingleComboBox-clearButton')

  await t
    // コンボボックスをクリックするとテキストボックスがフォーカスされること
    .click(combobox)
    .expect(combobox.focused)
    .ok()
    // アイテムを選択できること
    .click(listbox.find('.smarthr-ui-ComboBox-selectButton').withText('option 1'))
    .expect(combobox.value)
    .eql('option 1')
    // リストボックスが非表示になること
    .expect(listbox.visible)
    .notOk()
    // 選択したアイテムを選択解除できること
    .click(clearButton)
    .expect(combobox.value)
    .eql('')
})

test('リストボックスが開閉できること', async (t) => {
  const combobox = Selector('[data-test=single-combobox-default]')
  const listbox = elementWithId(await combobox.getAttribute('aria-controls'))

  await t
    // コンボボックスをクリックするとリストボックスが表示されること
    .click(combobox)
    .expect(listbox.visible)
    .ok()
    // 外側をクリックするとリストボックスが非表示になること
    .click('body', { offsetX: 0, offsetY: 0 })
    .expect(listbox.visible)
    .notOk()
    // 再度リストボックスを開く
    .click(combobox)
    // リストボックス表示中に Escape キーを押下するとリストボックスが非表示になること
    .pressKey('esc')
    .expect(listbox.visible)
    .notOk()
    // 再度リストボックスを開く
    .click(combobox)
    // リストボックス表示中に Tab キーを押下するとリストボックスが非表示になること
    .pressKey('tab')
    .expect(listbox.visible)
    .notOk()
})

test('コンボボックスがフォーカスされていない時に選択解除ボタンを押下してもリストボックスが表示されること', async (t) => {
  const combobox = Selector('[data-test=single-combobox-default]')
  const listbox = elementWithId(await combobox.getAttribute('aria-controls'))
  const clearButton = combobox.sibling().find('.smarthr-ui-SingleComboBox-clearButton')

  await t
    // アイテムを選択
    .click(combobox)
    .click(listbox.find('.smarthr-ui-ComboBox-selectButton').withText('option 1'))
    // 外側をクリックしてフォーカスを外す
    .click('body', { offsetX: 0, offsetY: 0 })
    // 選択したアイテムを選択解除できること
    .click(clearButton)
    .expect(listbox.visible)
    .ok()
})

test('新しいアイテムを追加できること', async (t) => {
  const combobox = Selector('[data-test=single-combobox-creatable]')
  const listbox = elementWithId(await combobox.getAttribute('aria-controls'))
  const addButton = listbox.find('.smarthr-ui-ComboBox-addButton')
  const clearButton = combobox.sibling().find('.smarthr-ui-SingleComboBox-clearButton')

  await t
    // 新しいアイテムを追加できること
    .click(combobox)
    .typeText(combobox, 'test new item')
    .click(addButton)
    .expect(combobox.value)
    .eql('test new item')
    // 選択したアイテムを選択解除できること
    .click(clearButton)
    .expect(combobox.value)
    .eql('')
    // 新しく追加したアイテムがリストボックス内に存在すること
    .click(combobox)
    .expect(listbox.find('.smarthr-ui-ComboBox-selectButton').withText('test new item').exists)
    .ok()
})

test('disabled なコンボボックスではアイテムの選択と選択解除ができないこと', async (t) => {
  const normalCombobox = Selector('[data-test=single-combobox-default]')
  const normalListbox = elementWithId(await normalCombobox.getAttribute('aria-controls'))
  const disabledCombobox = Selector('[data-test=single-combobox-disabled]')
  const disabledListbox = elementWithId(await disabledCombobox.getAttribute('aria-controls'))

  await t
    // disabled なコンボボックスをクリックしてもリストボックスは表示されないこと
    .click(disabledCombobox)
    .expect(disabledListbox.visible)
    .notOk()
    // 有効なコンボボックスでアイテム選択
    .click(normalCombobox)
    .click(normalListbox.find('.smarthr-ui-ComboBox-selectButton').withText('option 1'))
    // disabled なコンボボックスにクリアボタンが表示されないこと
    .expect(disabledCombobox.sibling().find('.smarthr-ui-SingleComboBox-clearButton').visible)
    .notOk()
})

test('キーボードで操作できること', async (t) => {
  const combobox = Selector('[data-test=single-combobox-default]')

  await t
    .pressKey('tab')
    .expect(combobox.focused)
    .ok()
    .pressKey('down')
    .pressKey('enter')
    .expect(combobox.value)
    .eql('option 1')
    .pressKey('up')
    .pressKey('up')
    .pressKey('up')
    .pressKey('enter')
    .expect(combobox.value)
    .eql('option 5')
})

test('キーボードで操作しても親要素のformがsubmitされないこと', async (t) => {
  const combobox = Selector('[data-test=single-combobox-no-form-submit]')

  await t.pressKey('tab').pressKey('down').pressKey('enter').expect(combobox.value).eql('option 1')
})
