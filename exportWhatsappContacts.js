function exportWhatsappContacts() {
  const contactFlatList = document.querySelectorAll('#pane-side > div')[0];

  const flatListProps = Object.keys(contactFlatList).find((prop) =>
    prop.startsWith('__reactProps'),
  );

  if (!flatListProps) {
    throw new Error('Não foi possível identificar a propriedade da flatlist de contatos');
  }

  const flatListData = contactFlatList[flatListProps].children.props.data.map((item) => item.data);

  const contacts = flatListData
    .filter((item) => item.__x_isGroup === false)
    .map((item) => {
      const lastMessageDateUtc = item.__x_t ? new Date(Number(item.__x_t) * 1000) : null;
      // const formatedLastMessageTime = lastMessageDateUtc ?
      // `${lastMessageDateUtc.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : '-';

      const formatedLastMessageTime = lastMessageDateUtc ?
      `${lastMessageDateUtc.getFullYear()}-${String(Number(lastMessageDateUtc.getMonth())+1).padStart(2, '0')}-${lastMessageDateUtc.getDate()}` : '-';

      const contact = {
        formattedTitle: item.__x_formattedTitle,
        name: item.__x_name,
        displayName: item.__x_contact.__x_displayName,
        formattedName: item.__x_contact.__x_formattedName,
        formattedShortName: item.__x_contact.__x_formattedShortName,
        formattedUser: item.__x_contact.__x_formattedUser,
        isGroup: item.__x_isGroup,
        notSpam: item.__x_notSpam,
        trusted: item.__x_trusted,
        isWAContact: item.__x_contact.__x_isWAContact,
        isMyContact: item.__x_contact.__x_isMyContact,
        isUser: item.__x_isUser,
        isBusiness: item.__x_contact.__x_isBusiness,
        isEnterprise: item.__x_contact.__x_isEnterprise,
        hasUnread: item.__x_hasUnread,
        unreadCoun: item.__x_unreadCount,
        lasMessageTime: item.__x_t,
        formatedLastMessageTime,
      };
      return contact;
    });

  // Complete export
  // const headerLine = `${Object.keys(contacts[0]).join(';')}\n`;
  // console.log(headerLine);
  // const rawLines = contacts.map(contact => `${Object.values(contact).join(';')}\n`);
  // const fileContent = [headerLine,...rawLines];

  const fileContent = contacts
    .filter((contact) => contact.formattedTitle.startsWith('+'))
    .map((contact) => `'${contact.formattedTitle}, ${contact.formatedLastMessageTime}\n`);

  const fileData = new Blob([fileContent.join('')], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(fileData);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contatos-whatsapp.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
}

exportWhatsappContacts();